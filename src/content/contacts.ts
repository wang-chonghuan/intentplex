import type {L10n} from '~/i18n/locale';

export const contactsPage = {
  title: {en: 'Contacts', zh: '联系'} satisfies L10n<string>,
  lede: {
    en: 'Email is the one I actually read. Everything else is where the writing lands.',
    zh: '邮件是我真的会看的那个。其余都是文字最后落到的地方。',
  } satisfies L10n<string>,
  emailLabel: {en: 'Email', zh: '邮箱'} satisfies L10n<string>,
  email: 'hello@intentplex.com',
  elsewhereLabel: {en: 'Elsewhere', zh: '其他'} satisfies L10n<string>,
} as const;

export type ContactLink = {
  id: string;
  name: string;
  handle: string;
  href: string;
};

export const contactLinks: readonly ContactLink[] = [
  {
    id: 'x',
    name: 'X',
    handle: '@yongwang',
    href: 'https://example.com/x',
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: 'wang-chonghuan',
    href: 'https://github.com/wang-chonghuan',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/yongwang',
    href: 'https://example.com/linkedin',
  },
  {
    id: 'newsletter',
    name: 'The Intent Letter',
    handle: 'intentplex.substack.com',
    href: 'https://example.com/newsletter',
  },
  {
    id: 'wechat',
    name: 'WeChat',
    handle: 'intentplex',
    href: 'https://example.com/wechat',
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    handle: 'intentplex',
    href: 'https://example.com/xiaohongshu',
  },
] as const;
