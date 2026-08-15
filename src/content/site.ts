import type {L10n} from '~/i18n/locale';

/** Chrome, navigation and footer copy. */
export const site = {
  name: 'Yong Wang',
  wordmark: 'intentplex',
  tagline: {
    en: 'CTO · AI fintech, Dublin',
    zh: 'CTO · AI 金融科技，都柏林',
  } satisfies L10n<string>,
  nav: {
    home: {en: 'Home', zh: '首页'},
    posts: {en: 'Posts', zh: '动态'},
    essays: {en: 'Essays', zh: '文章'},
    work: {en: 'Work', zh: '作品'},
    media: {en: 'Media', zh: '媒体矩阵'},
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
  footer: {
    note: {
      en: 'Built with TanStack Start, Astryx and StyleX. Written in Dublin.',
      zh: '用 TanStack Start、Astryx 与 StyleX 搭建，写于都柏林。',
    },
    rights: {
      en: '© 2026 Yong Wang',
      zh: '© 2026 Yong Wang',
    },
  } satisfies Record<string, L10n<string>>,
} as const;
