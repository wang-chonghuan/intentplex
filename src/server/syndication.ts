import '@tanstack/react-start/server-only';

import {query} from '~/db/pool';
import {isChannel} from '~/content/channels';

/**
 * The queue between the website and the machine that can actually post.
 *
 * Posting happens on the author's own computer, driving their signed-in browser
 * — a button in a container in Azure cannot reach that session. So the website
 * does not send anything. It sets a row to `approved` and the local skill, which
 * *is* signed in, picks it up.
 *
 * The status ladder is what keeps a crash from double-posting:
 *
 *   draft → approved → posting → posted
 *
 * `posting` is written **before** the network call and `posted` only after a
 * remote URL comes back. A run that dies in between leaves a row parked in
 * `posting`, which is visible and needs a person — much better than a row that
 * looks unsent and gets sent again.
 */

export type Row = {
  channel: string;
  body: string;
  status: string;
  remote_url: string | null;
  posted_at: string | null;
};

export async function forEntry(entryId: string): Promise<Array<Row>> {
  const rows = await query<Omit<Row, 'posted_at'> & {posted_at: Date | null}>(
    `select channel, body, status, remote_url, posted_at
       from syndication where entry_id = $1 order by channel`,
    [entryId],
  );
  return rows.map((r) => ({...r, posted_at: r.posted_at?.toISOString() ?? null}));
}

export async function saveBody(entryId: string, channel: string, body: string): Promise<void> {
  if (!isChannel(channel)) throw new Error(`unknown channel: ${channel}`);
  await query(
    `insert into syndication (id, entry_id, channel, body, status)
          values (gen_random_uuid(), $1, $2, $3, 'draft')
     on conflict (entry_id, channel) do update
            set body = excluded.body, updated_at = now()`,
    [entryId, channel, body],
  );
}

const SETTABLE = new Set(['draft', 'approved', 'skip']);

export async function setStatus(entryId: string, channel: string, status: string): Promise<void> {
  if (!isChannel(channel)) throw new Error(`unknown channel: ${channel}`);
  // `posting` and `posted` belong to the sender, not the website. Letting the UI
  // write them would let a person mark something posted that never was.
  if (!SETTABLE.has(status)) throw new Error(`status ${status} is not the website's to set`);
  await query(
    `update syndication set status = $3, updated_at = now()
      where entry_id = $1 and channel = $2`,
    [entryId, channel, status],
  );
}

/** What the local sender asks for: everything the author approved. */
export async function claimNext(): Promise<
  | {
      id: string;
      channel: string;
      body: string;
      entrySlug: string;
      coverPath: string | null;
    }
  | null
> {
  // One statement, so two senders running at once cannot both take the same row:
  // the update is what claims it, and only the claimer sees it returned.
  const rows = await query<{
    id: string;
    channel: string;
    body: string;
    slug: string;
    cover_path: string | null;
  }>(
    `update syndication s
        set status = 'posting', updated_at = now()
      where s.id = (
        select id from syndication
         where status = 'approved'
         order by updated_at
         for update skip locked
         limit 1)
    returning s.id, s.channel, s.body,
              (select slug from entry where id = s.entry_id) as slug,
              (select m.path from entry e left join media m on m.id = e.cover_media_id
                where e.id = s.entry_id) as cover_path`,
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    channel: row.channel,
    body: row.body,
    entrySlug: row.slug,
    coverPath: row.cover_path,
  };
}

export async function markPosted(id: string, remoteUrl: string): Promise<void> {
  await query(
    `update syndication set status = 'posted', remote_url = $2, posted_at = now(),
            updated_at = now()
      where id = $1`,
    [id, remoteUrl],
  );
}

/** Hand a claimed row back when the send failed, so it is not stuck in `posting`. */
export async function release(id: string): Promise<void> {
  await query(
    `update syndication set status = 'approved', updated_at = now()
      where id = $1 and status = 'posting'`,
    [id],
  );
}

/**
 * Everything waiting on a person, across every entry.
 *
 * The website cannot post — that needs the author's signed-in browser, which is
 * on their laptop. So `approved` means *waiting for a human to run the sender*,
 * and until this view existed that fact was only visible inside one entry's
 * page. `posting` is kept separate: a row parked there is a send that crashed
 * mid-flight, and it needs a person rather than another run.
 */
export async function pendingWork(): Promise<
  Array<{id: string; entryId: string; slug: string; channel: string; status: string}>
> {
  return query(
    `select s.id, s.entry_id as "entryId", e.slug, s.channel, s.status
       from syndication s
       join entry e on e.id = s.entry_id
      where s.status in ('approved', 'posting')
      order by s.status desc, s.updated_at`,
  );
}
