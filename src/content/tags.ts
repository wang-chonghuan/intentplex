import type {L10n} from '~/i18n/locale';

/**
 * How a tag reads in each language.
 *
 * This is a translation dictionary, **not** a list of which tags exist. Which
 * filters a page offers is derived from the items on that page — see
 * `collectTags` in `~/components/TagFilter`. Adding an item with a new tag
 * makes that filter appear on its own; the only thing this file owes it is a
 * pair of labels.
 */
export const tagLabels: Record<string, L10n<string>> = {
  agents: {en: 'Agents', zh: 'Agent'},
  harness: {en: 'Harness', zh: 'Harness'},
  engineering: {en: 'Engineering', zh: '工程'},
  product: {en: 'Product', zh: '产品'},
  team: {en: 'Team', zh: '团队'},
  fintech: {en: 'Fintech', zh: '金融科技'},
  philosophy: {en: 'Philosophy', zh: '哲学'},
  education: {en: 'Education', zh: '教育'},
  boardgames: {en: 'Board games', zh: '桌游'},
  reading: {en: 'Reading', zh: '阅读'},
  writing: {en: 'Writing', zh: '写作'},
  tools: {en: 'Tools', zh: '工具'},
  data: {en: 'Data', zh: '数据'},
};

/** A tag with no entry above still filters; it just shows its raw key. */
export function tagLabel(tag: string): L10n<string> {
  return tagLabels[tag] ?? {en: tag, zh: tag};
}
