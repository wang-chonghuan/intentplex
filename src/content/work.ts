import type {L10n} from '~/i18n/locale';

export type ProjectStage = 'live' | 'beta' | 'archived';

export const workPage = {
  title: {en: 'Work', zh: '作品'} satisfies L10n<string>,
  lede: {
    en: 'Side projects, most of them built to answer a question I could not answer by arguing. A few of them are still up.',
    zh: '一些 side project，大多是为了回答某个光靠争论回答不了的问题而做的。其中几个还活着。',
  } satisfies L10n<string>,
  stageLabel: {
    live: {en: 'Live', zh: '运行中'},
    beta: {en: 'Beta', zh: '内测'},
    archived: {en: 'Archived', zh: '已归档'},
  } satisfies Record<ProjectStage, L10n<string>>,
  metricsHeading: {en: 'Numbers I keep an eye on', zh: '我会盯着的几个数字'} satisfies L10n<string>,
  stackLabel: {en: 'Stack', zh: '技术栈'} satisfies L10n<string>,
  visitLabel: {en: 'Open project', zh: '打开项目'} satisfies L10n<string>,
} as const;

export const workMetrics = [
  {
    id: 'projects',
    value: '11',
    label: {en: 'Projects shipped', zh: '上线的项目'},
    detail: {en: 'since 2019', zh: '自 2019 年起'},
  },
  {
    id: 'live',
    value: '4',
    label: {en: 'Still running', zh: '还在运行'},
    detail: {en: 'and still costing me money', zh: '并且还在烧我的钱'},
  },
  {
    id: 'users',
    value: '38k',
    label: {en: 'Monthly readers', zh: '月度读者'},
    detail: {en: 'across all projects', zh: '所有项目合计'},
  },
  {
    id: 'oss',
    value: '2.4k',
    label: {en: 'GitHub stars', zh: 'GitHub 星标'},
    detail: {en: 'mostly from one repo', zh: '大部分来自同一个仓库'},
  },
] satisfies ReadonlyArray<{
  id: string;
  value: string;
  label: L10n<string>;
  detail: L10n<string>;
}>;

export type Project = {
  id: string;
  year: string;
  stage: ProjectStage;
  name: string;
  href: string;
  tagline: L10n<string>;
  description: L10n<string>;
  stack: readonly string[];
};

export const projects: readonly Project[] = [
  {
    id: 'w-intentplex',
    year: '2026',
    stage: 'live',
    name: 'intentplex',
    href: 'https://github.com/wang-chonghuan/intentplex',
    tagline: {
      en: 'This site, and the writing system behind it',
      zh: '这个网站，以及它背后的写作系统',
    },
    description: {
      en: 'A bilingual personal site where every string is authored in both languages at the same time, so a half-translated page is a type error rather than a discovery.',
      zh: '一个双语个人站点：每一段文案都在同一处同时用两种语言写好，于是「翻译到一半」是类型错误，而不是上线后才发现的问题。',
    },
    stack: ['TanStack Start', 'StyleX', 'Astryx'],
  },
  {
    id: 'w-rulesmith',
    year: '2025',
    stage: 'live',
    name: 'Rulesmith',
    href: 'https://example.com/rulesmith',
    tagline: {
      en: 'A linter for board game rulebooks',
      zh: '一个给桌游规则书用的 linter',
    },
    description: {
      en: 'Parses a rulebook into a state machine and reports unreachable rules, undefined terms, and turn phases with no exit condition. Designers use it. Publishers pretend they do not.',
      zh: '把规则书解析成状态机，报告不可达规则、未定义术语，以及没有退出条件的回合阶段。设计师在用，出版方装作没在用。',
    },
    stack: ['TypeScript', 'Peggy', 'D3'],
  },
  {
    id: 'w-socratic',
    year: '2025',
    stage: 'beta',
    name: 'Socratic Deck',
    href: 'https://example.com/socratic-deck',
    tagline: {
      en: 'Spaced repetition that asks instead of tells',
      zh: '会提问而不是告知的间隔重复',
    },
    description: {
      en: 'Cards that refuse to show you the answer until you have written a wrong one. Retention went up 40% in a small classroom trial; frustration went up considerably more.',
      zh: '在你写下一个错误答案之前，卡片不会给你正确答案。小范围课堂试验里记忆留存提升了 40%，挫败感提升得更多。',
    },
    stack: ['React', 'SQLite', 'FSRS'],
  },
  {
    id: 'w-ledgerlens',
    year: '2024',
    stage: 'live',
    name: 'LedgerLens',
    href: 'https://example.com/ledgerlens',
    tagline: {
      en: 'Reading a company through its transactions',
      zh: '从交易流水里读一家公司',
    },
    description: {
      en: 'An open dataset and viewer for anonymised SME transaction patterns. Built for a talk, kept alive because three universities started teaching from it.',
      zh: '一个开放数据集和查看器，展示脱敏后的中小企业交易模式。本来是为一次演讲做的，因为有三所大学拿它当教材就留了下来。',
    },
    stack: ['Python', 'DuckDB', 'Observable'],
  },
  {
    id: 'w-marginalia',
    year: '2023',
    stage: 'archived',
    name: 'Marginalia',
    href: 'https://example.com/marginalia',
    tagline: {
      en: 'Public reading notes with an argument graph',
      zh: '带论证图的公开读书笔记',
    },
    description: {
      en: 'Every highlight had to be linked to a claim it supported or attacked. It made me read better and post less. Archived when I admitted those were the same thing.',
      zh: '每一条划线都必须连到它支持或反驳的某个论点上。它让我读得更好、发得更少。当我承认这两件事是同一件事之后，就归档了。',
    },
    stack: ['Svelte', 'Neo4j'],
  },
  {
    id: 'w-tempo',
    year: '2022',
    stage: 'archived',
    name: 'Tempo',
    href: 'https://example.com/tempo',
    tagline: {
      en: 'A standup tool that deleted itself after 90 days',
      zh: '一个 90 天后自我删除的站会工具',
    },
    description: {
      en: 'Written to test whether a team ritual survives without its tooling. It did. That was the whole finding, so the project ended.',
      zh: '写它是为了验证一个团队仪式在失去工具后能不能活下来。结果是能。这就是全部结论，所以项目结束了。',
    },
    stack: ['Go', 'Slack API'],
  },
] as const;
