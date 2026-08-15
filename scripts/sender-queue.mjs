/**
 * The queue, from the sender's side.
 *
 * Posting cannot happen in the container: it needs the author's signed-in
 * browser, which is on their laptop. So the website only ever marks a row
 * `approved`, and this is what the local sender talks to.
 *
 * It connects to the same Postgres the site uses. That is deliberate — the
 * alternative is an HTTP API on the public site that can move someone's
 * publishing queue, protected by a second secret, for one user on one machine.
 *
 *   node --env-file=.env scripts/sender-queue.mjs claim
 *   node --env-file=.env scripts/sender-queue.mjs posted <id> <url>
 *   node --env-file=.env scripts/sender-queue.mjs release <id>
 *   node --env-file=.env scripts/sender-queue.mjs list
 */
import pg from 'pg';

const [command, ...args] = process.argv.slice(2);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set — see runbook.md.');
  process.exit(1);
}
const pool = new pg.Pool({connectionString, max: 2});
const out = (value) => console.log(JSON.stringify(value, null, 2));

try {
  if (command === 'claim') {
    // One statement, so two senders cannot take the same row: the update is the
    // claim, and only the claimer sees it returned. `posting` is written before
    // anything is sent, so a crash leaves a visible stuck row instead of a
    // row that looks unsent and gets sent twice.
    const {rows} = await pool.query(`
      update syndication s set status = 'posting', updated_at = now()
       where s.id = (select id from syndication where status = 'approved'
                      order by updated_at for update skip locked limit 1)
      returning s.id, s.channel, s.body,
                (select slug from entry where id = s.entry_id) as slug,
                (select m.path from entry e left join media m on m.id = e.cover_media_id
                  where e.id = s.entry_id) as cover_path`);
    out(rows[0] ?? null);
  } else if (command === 'posted') {
    const [id, url] = args;
    if (!id || !url) throw new Error('usage: posted <id> <url>');
    await pool.query(
      `update syndication set status='posted', remote_url=$2, posted_at=now(), updated_at=now()
        where id = $1`, [id, url]);
    out({id, status: 'posted', remote_url: url});
  } else if (command === 'release') {
    const [id] = args;
    if (!id) throw new Error('usage: release <id>');
    await pool.query(
      `update syndication set status='approved', updated_at=now()
        where id=$1 and status='posting'`, [id]);
    out({id, status: 'approved'});
  } else if (command === 'list') {
    const {rows} = await pool.query(`
      select s.id, s.channel, s.status, s.remote_url, e.slug
        from syndication s join entry e on e.id = s.entry_id
       where s.status in ('approved','posting') order by s.updated_at`);
    out(rows);
  } else if (command === 'image') {
    // The sender needs the actual bytes to attach; Weibo in particular wants one.
    const [path] = args;
    const {rows} = await pool.query('select bytes, mime from media where path = $1', [path]);
    if (!rows[0]) throw new Error(`no such image: ${path}`);
    process.stdout.write(rows[0].bytes);
  } else {
    console.error('commands: claim | posted <id> <url> | release <id> | list | image <path>');
    process.exitCode = 2;
  }
} finally {
  await pool.end();
}
