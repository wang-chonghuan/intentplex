import type {L10n} from '~/i18n/locale';

export type PostTopic = 'build' | 'read' | 'teach' | 'play';

export const postsPage = {
  title: {en: 'Posts', zh: '动态'} satisfies L10n<string>,
  lede: {
    en: 'Short notes, written the day they happened. Half-formed on purpose — the ones that survive a month usually turn into essays.',
    zh: '当天写下的短笔记，故意留在半成品状态。能活过一个月的，通常会长成一篇文章。',
  } satisfies L10n<string>,
  filterLabel: {en: 'Filter posts by topic', zh: '按主题筛选动态'} satisfies L10n<string>,
  topics: {
    all: {en: 'All', zh: '全部'},
    build: {en: 'Building', zh: '工程'},
    read: {en: 'Reading', zh: '阅读'},
    teach: {en: 'Teaching', zh: '教育'},
    play: {en: 'Games', zh: '桌游'},
  } satisfies Record<'all' | PostTopic, L10n<string>>,
  emptyTitle: {en: 'Nothing under this topic yet', zh: '这个主题下还没有内容'} satisfies L10n<string>,
  emptyBody: {
    en: 'Pick another topic, or check back after the next long flight.',
    zh: '换个主题看看，或者等我下一趟长途飞行之后再来。',
  } satisfies L10n<string>,
  countLabel: {en: 'posts', zh: '条'} satisfies L10n<string>,
} as const;

export type Post = {
  id: string;
  date: string;
  topic: PostTopic;
  body: L10n<string>;
  replies: number;
  likes: number;
};

export const posts: readonly Post[] = [
  {
    id: 'p-011',
    date: '2026-08-11T09:20:00Z',
    topic: 'build',
    body: {
      en: 'Spent the morning deleting a retry loop I wrote in March. It was hiding a schema mismatch by making it intermittent. The bug had been "flaky" for five months because I gave it somewhere to hide.',
      zh: '一上午都在删我三月份写的重试逻辑。它把一个 schema 不匹配的问题变成了偶发，于是这个 bug「flaky」了五个月——因为是我给了它藏身的地方。',
    },
    replies: 4,
    likes: 63,
  },
  {
    id: 'p-010',
    date: '2026-08-06T19:05:00Z',
    topic: 'teach',
    body: {
      en: 'A junior asked me how to get better at code review. My honest answer: read three merged PRs from someone you respect, before you write a single comment on anyone else\'s.',
      zh: '有位刚入行的同事问我怎么把 code review 做好。我的真实答案是：在给别人写第一条评论之前，先完整读三个你尊敬的人已合并的 PR。',
    },
    replies: 11,
    likes: 148,
  },
  {
    id: 'p-009',
    date: '2026-07-29T21:40:00Z',
    topic: 'play',
    body: {
      en: 'Brass: Birmingham, six players, four hours, one broken friendship over a coal shortage. The rulebook is 12 pages. Our house rules are now 3. This is what good design does to arguments.',
      zh: '《伯明翰》六人局，四小时，因为一次缺煤毁掉一段友谊。规则书 12 页，我们自己加的补充规则现在有 3 条。好设计对争吵的作用大概就是这样。',
    },
    replies: 7,
    likes: 92,
  },
  {
    id: 'p-008',
    date: '2026-07-22T08:15:00Z',
    topic: 'read',
    body: {
      en: 'Re-reading Dewey on habit. His claim that habit is not repetition but a predisposition to a *kind* of response maps disturbingly well onto how we fine-tune models.',
      zh: '重读杜威谈习惯。他说习惯不是重复，而是对某「一类」回应的倾向性——这个说法套到我们微调模型的方式上，贴合得有点吓人。',
    },
    replies: 2,
    likes: 71,
  },
  {
    id: 'p-007',
    date: '2026-07-14T12:00:00Z',
    topic: 'build',
    body: {
      en: 'Our agent evaluation suite finally runs in under four minutes. The trick was not parallelism. It was admitting that 40% of the cases tested the prompt, not the system.',
      zh: 'Agent 的评测套件终于跑进四分钟以内。诀窍不是并行，而是承认其中 40% 的用例测的是提示词，不是系统。',
    },
    replies: 5,
    likes: 110,
  },
  {
    id: 'p-006',
    date: '2026-07-02T17:30:00Z',
    topic: 'teach',
    body: {
      en: 'Built a two-hour workshop for our support team on how the model actually fails. Attendance was optional. Everyone came. Nobody has filed a "the AI is broken" ticket since.',
      zh: '给客服团队做了两小时的工作坊，讲模型到底会怎么出错。自愿参加，结果全员到齐。从那以后再没收到过「AI 坏了」这种工单。',
    },
    replies: 9,
    likes: 205,
  },
  {
    id: 'p-005',
    date: '2026-06-25T10:10:00Z',
    topic: 'play',
    body: {
      en: 'Prototyped a card game about technical debt. You draw shortcuts, they pay off immediately, and the interest deck shuffles into the draw pile on round four. Playtesters hated round four. Correct.',
      zh: '做了个关于技术债的卡牌游戏原型。你抽到的是各种捷径，立刻见效，然后利息牌堆会在第四轮洗进牌库。试玩的人都讨厌第四轮。这就对了。',
    },
    replies: 14,
    likes: 187,
  },
  {
    id: 'p-004',
    date: '2026-06-18T07:45:00Z',
    topic: 'read',
    body: {
      en: 'Finished a book on Irish canal engineering. Every infrastructure project is a bet on a demand curve that has not happened yet. Nothing has changed.',
      zh: '读完一本讲爱尔兰运河工程的书。每一个基础设施项目，都是在赌一条尚未发生的需求曲线。这一点从来没变过。',
    },
    replies: 1,
    likes: 44,
  },
] as const;
