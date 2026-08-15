import type {L10n} from '~/i18n/locale';

export const contactsPage = {
  title: {en: 'Contacts', zh: '联系'} satisfies L10n<string>,
  lede: {
    en: 'Email is the one I actually read. Everything else is where the writing lands.',
    zh: '邮件是我真的会看的那个。其余都是文字最后落到的地方。',
  } satisfies L10n<string>,
  emailLabel: {en: 'Email', zh: '邮箱'} satisfies L10n<string>,
  email: 'intentplex@gmail.com',
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
    handle: '@intentplex',
    href: 'https://x.com/intentplex',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'in/chonghuan',
    href: 'https://www.linkedin.com/in/chonghuan',
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: 'wang-chonghuan',
    href: 'https://github.com/wang-chonghuan',
  },
] as const;
