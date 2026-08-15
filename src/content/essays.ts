import type {L10n} from '~/i18n/locale';

export type EssaySeries = 'engineering' | 'philosophy' | 'education';

export const essaysPage = {
  title: {en: 'Essays', zh: '文章'} satisfies L10n<string>,
  lede: {
    en: 'Longer pieces, written slowly. Each one exists because I could not get to the end of the argument in a conversation.',
    zh: '写得慢的长文。每一篇的存在，都是因为我没能在一次对话里把那个论证讲完。',
  } satisfies L10n<string>,
  featuredLabel: {en: 'Latest', zh: '最新'} satisfies L10n<string>,
  archiveLabel: {en: 'Archive', zh: '存档'} satisfies L10n<string>,
  seriesLabel: {en: 'Series', zh: '系列'} satisfies L10n<string>,
  readingTime: {
    en: (minutes: number) => `${minutes} min read`,
    zh: (minutes: number) => `约 ${minutes} 分钟`,
  },
  languageNote: {
    en: 'Available in',
    zh: '可读语言',
  } satisfies L10n<string>,
  series: {
    engineering: {en: 'Engineering', zh: '工程'},
    philosophy: {en: 'Philosophy', zh: '哲学'},
    education: {en: 'Education', zh: '教育'},
  } satisfies Record<EssaySeries, L10n<string>>,
} as const;

export type Essay = {
  id: string;
  date: string;
  series: EssaySeries;
  minutes: number;
  /** Which languages the piece itself was published in. */
  publishedIn: readonly ('en' | 'zh')[];
  title: L10n<string>;
  summary: L10n<string>;
  pullQuote?: L10n<string>;
};

export const essays: readonly Essay[] = [
  {
    id: 'e-07',
    date: '2026-07-30T00:00:00Z',
    series: 'education',
    minutes: 18,
    publishedIn: ['en', 'zh'],
    title: {
      en: 'Teaching Is a Design Problem, Not a Content Problem',
      zh: '教育是设计问题，不是内容问题',
    },
    summary: {
      en: 'Every course I have ever disliked had excellent material. The failure was never the content; it was the sequence, the feedback loop, and the refusal to let a learner be wrong in public safely.',
      zh: '我讨厌过的每一门课，材料都很好。失败从来不在内容，而在顺序、反馈回路，以及不肯让学习者安全地在众人面前犯错。',
    },
    pullQuote: {
      en: 'A syllabus is a UI. It has an information architecture, an error state, and a first-run experience — and almost nobody designs those on purpose.',
      zh: '教学大纲就是一个界面。它有信息架构、错误状态和首次使用体验——而几乎没有人是有意识地去设计这些的。',
    },
  },
  {
    id: 'e-06',
    date: '2026-06-11T00:00:00Z',
    series: 'engineering',
    minutes: 24,
    publishedIn: ['en', 'zh'],
    title: {
      en: 'Underwriting an Agent: What Fintech Taught Me About Autonomy',
      zh: '给 Agent 做核保：金融科技教会我的自主性边界',
    },
    summary: {
      en: 'Credit teams have spent forty years answering the question the AI industry is asking now: how much authority do you hand to a process you cannot fully inspect? The answer is a paper trail, not a benchmark.',
      zh: '信贷团队用四十年回答了 AI 行业现在才开始问的问题：你能把多少权限交给一个你无法完全检查的流程？答案是一条可追溯的记录链，而不是一个跑分。',
    },
  },
  {
    id: 'e-05',
    date: '2026-05-02T00:00:00Z',
    series: 'philosophy',
    minutes: 15,
    publishedIn: ['en'],
    title: {
      en: 'Intention Is Not a Prompt',
      zh: '意图不是提示词',
    },
    summary: {
      en: 'Anscombe asked what makes an action intentional. Forty years of philosophy of action turns out to be an unusually good spec document for anyone building systems that act on a person\'s behalf.',
      zh: 'Anscombe 追问的是：什么让一个行动成为「有意图的」。四十年的行动哲学，恰好是一份异常好用的规格说明书——对任何在为他人代行事的系统而言。',
    },
  },
  {
    id: 'e-04',
    date: '2026-03-19T00:00:00Z',
    series: 'engineering',
    minutes: 12,
    publishedIn: ['en', 'zh'],
    title: {
      en: 'The Four-Person Platform Team',
      zh: '四个人的平台团队',
    },
    summary: {
      en: 'What a startup platform team should refuse to build, and how to say no in a way that survives the next funding round.',
      zh: '创业公司的平台团队应该拒绝造什么，以及怎样把「不做」说得能撑过下一轮融资。',
    },
  },
  {
    id: 'e-03',
    date: '2026-01-24T00:00:00Z',
    series: 'philosophy',
    minutes: 20,
    publishedIn: ['zh'],
    title: {
      en: 'On Habit: Dewey, Fine-Tuning, and the Shape of a Disposition',
      zh: '论习惯：杜威、微调，以及倾向性的形状',
    },
    summary: {
      en: 'Reading Dewey next to a training run. Both describe the same thing: a system that has been shaped by its history into preferring one kind of response.',
      zh: '一边读杜威，一边看训练日志。两者描述的是同一件事：一个被自身历史塑造成偏好某类回应的系统。',
    },
  },
  {
    id: 'e-02',
    date: '2025-11-08T00:00:00Z',
    series: 'education',
    minutes: 10,
    publishedIn: ['en', 'zh'],
    title: {
      en: 'How to Read a Rulebook',
      zh: '怎么读一本规则书',
    },
    summary: {
      en: 'Board game rulebooks are the most ruthlessly tested technical documents in the world. Here is what they do that our engineering docs do not.',
      zh: '桌游规则书是世界上被测试得最狠的技术文档。这里说的是它们做对了、而我们的工程文档没做的那些事。',
    },
  },
] as const;
