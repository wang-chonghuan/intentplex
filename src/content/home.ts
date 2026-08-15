import type {L10n} from '~/i18n/locale';

export const home = {
  eyebrow: {
    en: 'Dublin, Ireland',
    zh: '爱尔兰 · 都柏林',
  } satisfies L10n<string>,
  headline: {
    en: 'I build systems that turn intent into working software.',
    zh: '我做的事，是把意图变成能跑起来的系统。',
  } satisfies L10n<string>,
  intro: {
    en: 'I am Yong Wang, CTO of an AI fintech startup in Dublin. My days go into agent architecture, risk-aware product engineering, and the unglamorous work of making a small team ship reliably. My evenings go into writing, side projects, and arguments about philosophy that nobody asked for.',
    zh: '我是 Yong Wang，在都柏林的一家 AI 金融科技创业公司做 CTO。白天的时间花在 Agent 架构、带风控意识的产品工程，以及让一支小团队稳定交付这件不太浪漫的事上。晚上的时间留给写作、side project，以及没人要求我参与的哲学争论。',
  } satisfies L10n<string>,
  actions: {
    readEssays: {en: 'Read the essays', zh: '读我的文章'},
    seeWork: {en: 'See what I built', zh: '看我做的东西'},
  } satisfies Record<string, L10n<string>>,

  nowHeading: {en: 'What I am on right now', zh: '最近在做的事'} satisfies L10n<string>,
  now: [
    {
      id: 'agents',
      label: {en: 'Shipping', zh: '在交付'},
      title: {
        en: 'An agent layer that underwrites credit decisions',
        zh: '一层为信贷决策做初审的 Agent 系统',
      },
      detail: {
        en: 'Retrieval, policy checks and a human sign-off step that a regulator can actually read.',
        zh: '检索、策略校验，加上一个监管方真的看得懂的人工签核环节。',
      },
      status: 'accent',
    },
    {
      id: 'writing',
      label: {en: 'Writing', zh: '在写'},
      title: {
        en: 'A long piece on why teaching is a design problem',
        zh: '一篇长文：为什么教育本质上是设计问题',
      },
      detail: {
        en: 'Third draft. Still too fond of its own metaphors.',
        zh: '第三稿。还是太迷恋自己的比喻。',
      },
      status: 'warning',
    },
    {
      id: 'games',
      label: {en: 'Playing', zh: '在玩'},
      title: {
        en: 'Teaching my group to lose gracefully at Brass: Birmingham',
        zh: '带着朋友们在《伯明翰》里学习优雅地输',
      },
      detail: {
        en: 'Six plays in. The canal era still ruins friendships.',
        zh: '打了六局。运河时代依然毁友谊。',
      },
      status: 'success',
    },
  ] satisfies ReadonlyArray<{
    id: string;
    label: L10n<string>;
    title: L10n<string>;
    detail: L10n<string>;
    status: 'accent' | 'warning' | 'success' | 'neutral' | 'error';
  }>,

  interestsHeading: {en: 'Three things I keep circling back to', zh: '三件我一直绕回来的事'} satisfies L10n<string>,
  interests: [
    {
      id: 'philosophy',
      variant: 'purple',
      name: {en: 'Philosophy', zh: '哲学'},
      body: {
        en: 'Mostly philosophy of mind and the pragmatists. It is the only training I have found that makes you slow down before you agree with yourself.',
        zh: '主要读心灵哲学和实用主义。这是我唯一找到的、能让人在同意自己之前先慢下来的训练。',
      },
    },
    {
      id: 'education',
      variant: 'teal',
      name: {en: 'Education', zh: '教育'},
      body: {
        en: 'How people actually learn hard things, and why most courseware optimises for coverage instead of understanding.',
        zh: '人到底怎么学会难的东西，以及为什么大多数课件在优化覆盖率，而不是理解。',
      },
    },
    {
      id: 'boardgames',
      variant: 'orange',
      name: {en: 'Board games', zh: '桌游'},
      body: {
        en: 'Heavy euros and negotiation games. A good ruleset is a product spec that thousands of strangers agreed to read.',
        zh: '偏重策略和谈判类。一套好规则，就是一份几千个陌生人愿意读完的产品文档。',
      },
    },
  ] satisfies ReadonlyArray<{
    id: string;
    variant: 'purple' | 'teal' | 'orange';
    name: L10n<string>;
    body: L10n<string>;
  }>,

  factsHeading: {en: 'The short version', zh: '简历版'} satisfies L10n<string>,
  facts: [
    {
      id: 'role',
      label: {en: 'Role', zh: '角色'},
      value: {en: 'CTO, AI fintech startup', zh: 'CTO，AI 金融科技创业公司'},
    },
    {
      id: 'based',
      label: {en: 'Based in', zh: '常驻'},
      value: {en: 'Dublin, Ireland', zh: '爱尔兰都柏林'},
    },
    {
      id: 'focus',
      label: {en: 'Focus', zh: '专注'},
      value: {
        en: 'Agent systems, risk tooling, developer experience',
        zh: 'Agent 系统、风控工具、开发者体验',
      },
    },
    {
      id: 'writing',
      label: {en: 'Writing', zh: '写作'},
      value: {en: 'Essays in English and Chinese', zh: '中英双语长文'},
    },
    {
      id: 'languages',
      label: {en: 'Languages', zh: '语言'},
      value: {en: 'Chinese, English', zh: '中文、英文'},
    },
  ] satisfies ReadonlyArray<{id: string; label: L10n<string>; value: L10n<string>}>,
} as const;
