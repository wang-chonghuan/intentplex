import type {L10n} from '~/i18n/locale';

export type ChannelLanguage = 'en' | 'zh' | 'both';

export const mediaPage = {
  title: {en: 'Media', zh: '媒体矩阵'} satisfies L10n<string>,
  lede: {
    en: 'Where the writing actually lands. Different platforms get different halves of me — this page says which is which, so you can follow only the part you want.',
    zh: '这些文字最后落在哪里。不同平台承接我的不同侧面——这页把它们标清楚，你可以只关注你想要的那一半。',
  } satisfies L10n<string>,
  primaryHeading: {en: 'Main channels', zh: '主要渠道'} satisfies L10n<string>,
  secondaryHeading: {en: 'Also here', zh: '也在这些地方'} satisfies L10n<string>,
  cadenceLabel: {en: 'Cadence', zh: '更新频率'} satisfies L10n<string>,
  audienceLabel: {en: 'Audience', zh: '读者数'} satisfies L10n<string>,
  languageLabel: {en: 'Language', zh: '语言'} satisfies L10n<string>,
  followLabel: {en: 'Follow', zh: '关注'} satisfies L10n<string>,
  languageValue: {
    en: {en: 'English', zh: '英文'},
    zh: {en: 'Chinese', zh: '中文'},
    both: {en: 'Both', zh: '中英双语'},
  } satisfies Record<ChannelLanguage, L10n<string>>,
  crosspostNote: {
    en: 'Nothing here is exclusive. If a piece matters, it goes everywhere within a week — the platforms just decide the tone.',
    zh: '这里没有任何独家内容。真正重要的东西，一周之内会发到所有平台——平台只决定语气。',
  } satisfies L10n<string>,
} as const;

export type Channel = {
  id: string;
  name: string;
  handle: string;
  href: string;
  accent: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink' | 'gray';
  language: ChannelLanguage;
  audience: string;
  isPrimary: boolean;
  cadence: L10n<string>;
  what: L10n<string>;
};

export const channels: readonly Channel[] = [
  {
    id: 'c-newsletter',
    name: 'The Intent Letter',
    handle: 'intentplex.substack.com',
    href: 'https://example.com/newsletter',
    accent: 'orange',
    language: 'both',
    audience: '12,400',
    isPrimary: true,
    cadence: {en: 'Every other Sunday', zh: '每隔一个周日'},
    what: {
      en: 'One essay, sent whole. The only channel where I get to finish a thought without an algorithm interrupting.',
      zh: '一次一篇完整的文章。这是唯一一个能让我把一个想法讲完、而不被算法打断的渠道。',
    },
  },
  {
    id: 'c-x',
    name: 'X',
    handle: '@yongwang',
    href: 'https://example.com/x',
    accent: 'gray',
    language: 'en',
    audience: '9,100',
    isPrimary: true,
    cadence: {en: 'Most weekdays', zh: '工作日大多有'},
    what: {
      en: 'Build notes, failure post-mortems, and arguments with people who know more than I do.',
      zh: '工程笔记、失败复盘，以及和比我懂的人吵架。',
    },
  },
  {
    id: 'c-wechat',
    name: 'WeChat',
    handle: 'intentplex',
    href: 'https://example.com/wechat',
    accent: 'green',
    language: 'zh',
    audience: '21,800',
    isPrimary: true,
    cadence: {en: 'Weekly, Thursday', zh: '每周四'},
    what: {
      en: 'The Chinese-language home for the long essays, usually with an extra section written for readers back home.',
      zh: '长文的中文主场，通常会多写一节，是专门写给国内读者的。',
    },
  },
  {
    id: 'c-xiaohongshu',
    name: '小红书',
    handle: 'intentplex',
    href: 'https://example.com/xiaohongshu',
    accent: 'pink',
    language: 'zh',
    audience: '6,700',
    isPrimary: false,
    cadence: {en: 'A few times a month', zh: '每月几次'},
    what: {
      en: 'Board game photos, Dublin, and short takes on studying or working abroad.',
      zh: '桌游照片、都柏林，以及关于留学和海外工作的短想法。',
    },
  },
  {
    id: 'c-github',
    name: 'GitHub',
    handle: 'wang-chonghuan',
    href: 'https://github.com/wang-chonghuan',
    accent: 'purple',
    language: 'en',
    audience: '2,400',
    isPrimary: false,
    cadence: {en: 'Whenever something works', zh: '什么东西跑通了就更新'},
    what: {
      en: 'Source for everything on the Work page, plus the tools too small to deserve a page.',
      zh: '作品页上所有东西的源码，还有一些小到不配拥有单独页面的工具。',
    },
  },
  {
    id: 'c-podcast',
    name: 'Slow Takes',
    handle: 'slowtakes.fm',
    href: 'https://example.com/podcast',
    accent: 'teal',
    language: 'en',
    audience: '3,300',
    isPrimary: false,
    cadence: {en: 'Monthly, when a guest says yes', zh: '每月一期，前提是有嘉宾答应'},
    what: {
      en: 'Ninety minutes with someone who has changed their mind about something in public.',
      zh: '和一位曾经公开改变过自己看法的人聊九十分钟。',
    },
  },
  {
    id: 'c-linkedin',
    name: 'LinkedIn',
    handle: 'in/yongwang',
    href: 'https://example.com/linkedin',
    accent: 'blue',
    language: 'en',
    audience: '5,200',
    isPrimary: false,
    cadence: {en: 'Rarely, and I am sorry about it', zh: '很少，并且我为此道歉'},
    what: {
      en: 'Hiring posts and the occasional company milestone. The most professional and least interesting version of me.',
      zh: '招聘信息和偶尔的公司里程碑。这是最专业、也最无趣的那个我。',
    },
  },
] as const;
