import '@tanstack/react-start/server-only';

import {query} from '~/db/pool';
import * as repo from '~/db/repo';
import {CHANNELS, type Channel} from '~/content/channels';

/**
 * One Chinese source, five generated versions — and a cover when one is asked for.
 *
 * The entry is written in Chinese; the site's English version and the four
 * platform posts all come from a model. That asymmetry is deliberate and the
 * charter carries the rule that goes with it: a generated version is not
 * publishable until the author has read it (`ui.md`). Nothing here publishes —
 * it writes drafts and stops.
 *
 * The four platforms are not four copies of one text. Their shapes differ enough
 * that a single body posted everywhere reads badly in all four places, so each
 * channel carries its own brief (`channels.ts`) and the model is asked for one
 * output per channel rather than one output to be truncated.
 *
 * The models are the author's own Azure OpenAI deployments — the same ones the
 * local litellm proxy fronts for Codex. The proxy itself is not in the path:
 * it listens on 127.0.0.1 of a laptop, and this runs in a container.
 */

const AZURE_BASE = 'https://finleyswedencentralinstance.openai.azure.com/openai/v1';
const TEXT_MODEL = 'gpt-5.6-sol';
const IMAGE_MODEL = 'gpt-image-2';

type Generated = {
  en: {title: string; body: string};
  channels: Record<Channel, string>;
};

function apiKey(): string {
  const key = process.env.AZURE_OPENAI_API_KEY;
  if (!key) throw new Error('AZURE_OPENAI_API_KEY is not set — generation needs it.');
  return key;
}

function prompt(titleZh: string, bodyZh: string): string {
  const briefs = CHANNELS.map((c) => `- ${c.id}: ${c.brief}`).join('\n');
  return [
    'You are helping a bilingual author publish one piece of writing in several places.',
    'The Chinese text below is the original, written by the author. Everything you produce',
    'is a version of it, not a new piece: keep the claims, the order and the voice.',
    '',
    'The voice is first-person, plain, specific, and willing to be dry. No marketing register',
    'in either language. Do not add enthusiasm the original does not have.',
    '',
    'Produce:',
    "1. An English version of the whole piece for the author's own website — full length,",
    '   a faithful English rendering rather than a summary, plus an English title.',
    "2. One post per platform, each written for that platform's shape:",
    briefs,
    '',
    'Return JSON only, no prose around it, in exactly this shape:',
    '{"en":{"title":"...","body":"...markdown..."},"channels":{' +
      CHANNELS.map((c) => `"${c.id}":"..."`).join(',') +
      '}}',
    '',
    '--- Chinese original ---',
    `Title: ${titleZh}`,
    '',
    bodyZh,
  ].join('\n');
}

/** The model is asked for JSON; it sometimes wraps it in a fence anyway. */
function parseJson(text: string): Generated {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1]! : text).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('generation: model did not return JSON');
  return JSON.parse(raw.slice(start, end + 1)) as Generated;
}

export async function generateAll(entryId: string): Promise<Generated> {
  const rows = await query<{title: string; body_md: string}>(
    `select title, body_md from rendition where entry_id = $1 and lang = 'zh'`,
    [entryId],
  );
  const source = rows[0];
  if (!source) throw new Error('generation: this entry has no Chinese original to work from');

  const response = await fetch(`${AZURE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'api-key': apiKey()},
    body: JSON.stringify({
      model: TEXT_MODEL,
      // The job is a faithful rendering across four registers at once; it is
      // worth the extra thinking, and this runs once per entry.
      reasoning_effort: 'high',
      messages: [{role: 'user', content: prompt(source.title, source.body_md)}],
    }),
  });

  if (!response.ok) {
    throw new Error(`generation: ${response.status} ${(await response.text()).slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{message?: {content?: string}}>;
  };
  const generated = parseJson(payload.choices?.[0]?.message?.content ?? '');

  // Saved as drafts, every one of them. Publishing is a separate act the author
  // takes after reading — that is the whole point of the review rule.
  await query(
    `insert into rendition (id, entry_id, lang, title, body_md, origin)
          values (gen_random_uuid(), $1, 'en', $2, $3, 'generated')
     on conflict (entry_id, lang) do update
            set title = excluded.title, body_md = excluded.body_md, origin = 'generated'`,
    [entryId, generated.en.title, generated.en.body],
  );

  for (const channel of CHANNELS) {
    await query(
      `insert into syndication (id, entry_id, channel, body, status)
            values (gen_random_uuid(), $1, $2, $3, 'draft')
       on conflict (entry_id, channel) do update
              set body = excluded.body, status = 'draft', updated_at = now()`,
      [entryId, channel.id, generated.channels?.[channel.id] ?? ''],
    );
  }

  await query('update entry set generate_requested = false, updated_at = now() where id = $1', [
    entryId,
  ]);
  repo.invalidate();
  return generated;
}

/**
 * Draw a cover.
 *
 * Optional, and never automatic: the author uploads their own picture most of
 * the time, and a generated cover on a piece that did not ask for one is the
 * kind of filler this site does not run. Returns raw bytes for `uploadImage` to
 * put through the same pipeline an upload goes through — there is one way an
 * image gets into this site, and this is not a second one.
 */
export async function generateCover(promptText: string): Promise<Buffer> {
  const response = await fetch(`${AZURE_BASE}/images/generations`, {
    method: 'POST',
    headers: {'content-type': 'application/json', 'api-key': apiKey()},
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: promptText,
      n: 1,
      // Wide, because a cover is shown as a banner and as a 64px square, never
      // as a portrait.
      size: '1536x1024',
    }),
  });

  if (!response.ok) {
    throw new Error(`cover: ${response.status} ${(await response.text()).slice(0, 200)}`);
  }

  const payload = (await response.json()) as {data?: Array<{b64_json?: string; url?: string}>};
  const first = payload.data?.[0];
  if (first?.b64_json) return Buffer.from(first.b64_json, 'base64');
  if (first?.url) return Buffer.from(await (await fetch(first.url)).arrayBuffer());
  throw new Error('cover: the model returned neither bytes nor a url');
}
