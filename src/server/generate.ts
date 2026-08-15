import '@tanstack/react-start/server-only';

import {query} from '~/db/pool';
import * as repo from '~/db/repo';
import {CHANNELS, type Channel} from '~/content/channels';

/**
 * One Chinese source, five generated versions.
 *
 * The entry is written in Chinese; the site's English version and the four
 * platform posts all come from a model. That is a deliberate asymmetry and the
 * charter carries the rule that goes with it: a generated version is not
 * publishable until the author has read it (`ui.md`). Nothing here publishes —
 * it writes drafts and stops.
 *
 * The four platforms are not four copies of one text. Their shapes differ enough
 * that a single body posted everywhere reads badly in all four places, so each
 * channel carries its own brief (`channels.ts`) and the model is asked for one
 * output per channel rather than one output to be truncated.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

type Generated = {
  en: {title: string; body: string};
  channels: Record<Channel, string>;
};

function apiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set — generation needs it.');
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
    '1. An English version of the whole piece for the author\'s own website — full length,',
    '   a faithful English rendering rather than a summary, plus an English title.',
    '2. One post per platform, each written for that platform\'s shape:',
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
  const raw = (fenced ? fenced[1] : text).trim();
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

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{role: 'user', content: prompt(source.title, source.body_md)}],
    }),
  });

  if (!response.ok) {
    throw new Error(`generation: ${response.status} ${(await response.text()).slice(0, 200)}`);
  }

  const payload = (await response.json()) as {content?: Array<{text?: string}>};
  const text = payload.content?.map((c) => c.text ?? '').join('') ?? '';
  const generated = parseJson(text);

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
    const body = generated.channels?.[channel.id] ?? '';
    await query(
      `insert into syndication (id, entry_id, channel, body, status)
            values (gen_random_uuid(), $1, $2, $3, 'draft')
       on conflict (entry_id, channel) do update
              set body = excluded.body, status = 'draft', updated_at = now()`,
      [entryId, channel.id, body],
    );
  }

  repo.invalidate();
  return generated;
}
