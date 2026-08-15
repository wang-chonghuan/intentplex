import type {L10n} from '~/i18n/locale';

/** Chrome, navigation and footer copy. */
export const site = {
  name: 'Yong Wang',
  wordmark: 'intentplex',
  tagline: {
    en: 'Builder · CTO, AI fintech, Dublin',
    zh: 'Builder · CTO，AI 金融科技，都柏林',
  } satisfies L10n<string>,
  nav: {
    home: {en: 'Home', zh: '首页'},
    posts: {en: 'Posts', zh: '动态'},
    articles: {en: 'Articles', zh: '文章'},
    works: {en: 'Works', zh: '作品'},
    contacts: {en: 'Contacts', zh: '联系'},
  } satisfies Record<string, L10n<string>>,
  languageSwitch: {
    label: {en: 'Language', zh: '语言'},
    en: 'EN',
    zh: '中文',
  },
  appearance: {
    label: {en: 'Appearance', zh: '外观'},
    system: {en: 'Auto', zh: '跟随系统'},
    light: {en: 'Light', zh: '浅色'},
    dark: {en: 'Dark', zh: '深色'},
  } satisfies Record<string, L10n<string>>,
  filter: {
    label: {en: 'Filter by tag', zh: '按标签筛选'},
    all: {en: 'All', zh: '全部'},
    empty: {en: 'Nothing under this tag yet', zh: '这个标签下还没有内容'},
  } satisfies Record<string, L10n<string>>,
  detail: {
    back: {en: 'Back', zh: '返回'},
    notFound: {en: 'Not found', zh: '没有这一篇'},
  } satisfies Record<string, L10n<string>>,
  footer: {
    rights: {en: '© 2026 Yong Wang', zh: '© 2026 Yong Wang'},
  } satisfies Record<string, L10n<string>>,
} as const;
