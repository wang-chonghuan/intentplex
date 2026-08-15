import type {L10n} from '~/i18n/locale';

/**
 * The four places a piece goes, and what each one is actually like.
 *
 * This file is the reason the generation step produces four texts instead of
 * one. The platforms differ in the thing that decides whether a post works, not
 * just in a character limit, so each brief says what that thing is.
 *
 * Shared by the server (it goes into the prompt) and the admin UI (it labels and
 * counts), which is why it holds no server-only imports.
 */

export const CHANNELS = [
  {
    id: 'x-zh',
    label: {en: 'X (Chinese)', zh: 'X 中文'} satisfies L10n<string>,
    limit: 280,
    brief:
      'X in Chinese. 280 characters, and Chinese carries roughly two to three times ' +
      'as much per character as English, so a whole thought fits — use that rather ' +
      'than padding. One idea, no hashtags, no "a thread 🧵" framing.',
  },
  {
    id: 'x-en',
    label: {en: 'X (English)', zh: 'X 英文'} satisfies L10n<string>,
    limit: 280,
    brief:
      'X in English. 280 characters per post. If the piece has several distinct points, ' +
      'return them as a thread: separate posts joined by a blank line, each standing on ' +
      'its own. No hashtags.',
  },
  {
    id: 'linkedin',
    label: {en: 'LinkedIn', zh: 'LinkedIn'} satisfies L10n<string>,
    limit: 3000,
    brief:
      'LinkedIn, up to 3000 characters. The first ~200 characters are all that shows ' +
      'before "see more", so the opening has to carry the whole point rather than ' +
      'introduce it. Plain paragraphs, no emoji bullets, at most three hashtags at the end.',
  },
  {
    id: 'weibo',
    label: {en: 'Weibo', zh: '微博'} satisfies L10n<string>,
    limit: 2000,
    brief:
      '微博, up to 2000 characters, in Chinese. Written to be read on a phone: short ' +
      'paragraphs, concrete first line. Wrap one or two topics as #话题# — the syntax ' +
      'needs the closing # to register.',
  },
] as const;

export type Channel = (typeof CHANNELS)[number]['id'];

export const CHANNEL_IDS: ReadonlyArray<Channel> = CHANNELS.map((c) => c.id);

export function isChannel(value: string): value is Channel {
  return (CHANNEL_IDS as ReadonlyArray<string>).includes(value);
}
