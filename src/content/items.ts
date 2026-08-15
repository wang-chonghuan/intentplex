import type {L10n} from '~/i18n/locale';

export type ItemKind = 'post' | 'article' | 'work';

/**
 * One entry, whatever kind it is.
 *
 * Every page on this site is a reverse-chronological list of these, so they
 * share one shape: a page-specific type per collection would mean a branch per
 * kind everywhere the lists meet — the home feed most of all.
 */
export type Item = {
  /** Also the detail-page slug, for the kinds that have one. */
  id: string;
  kind: ItemKind;
  /** ISO 8601. The only ordering there is. */
  date: string;
  title: L10n<string>;
  image: {src: string; alt: L10n<string>};
  summary: L10n<string>;
  /** Detail-page paragraphs. Posts have none — they are the whole post. */
  body?: L10n<readonly string[]>;
};

const byNewest = (a: Item, b: Item) => b.date.localeCompare(a.date);

/**
 * Newest first, on a copy.
 *
 * Taking `readonly Item[]` is what makes the literals below check: sorting
 * an array literal in place strips its contextual type, and `kind` widens to
 * `string` before it ever reaches `Item`.
 */
const chronological = (items: readonly Item[]): readonly Item[] =>
  [...items].sort(byNewest);

export const posts: readonly Item[] = chronological([
  {
    id: 'retry-loop',
    kind: 'post',
    date: '2026-08-11T09:20:00Z',
    title: {
      en: 'The retry loop was hiding a schema mismatch',
      zh: '那段重试逻辑藏着一个 schema 不匹配',
    },
    image: {
      src: '/media/retry-loop.svg',
      alt: {en: 'Abstract loop diagram', zh: '抽象的循环示意图'},
    },
    summary: {
      en: 'Spent the morning deleting a retry loop I wrote in March. It made a schema mismatch intermittent, so the bug read as "flaky" for five months — because I gave it somewhere to hide.',
      zh: '一上午都在删我三月份写的重试逻辑。它把一个 schema 不匹配变成了偶发，于是这个 bug「flaky」了五个月——因为是我给了它藏身的地方。',
    },
  },
  {
    id: 'code-review-answer',
    kind: 'post',
    date: '2026-08-06T19:05:00Z',
    title: {
      en: 'How to get better at code review',
      zh: '怎么把 code review 做好',
    },
    image: {
      src: '/media/code-review-answer.svg',
      alt: {en: 'Stacked review panes', zh: '层叠的评审面板'},
    },
    summary: {
      en: 'My honest answer to a junior: read three merged PRs from someone you respect, before you write a single comment on anyone else\'s.',
      zh: '给刚入行同事的真实答案：在给别人写第一条评论之前，先完整读三个你尊敬的人已合并的 PR。',
    },
  },
  {
    id: 'brass-birmingham',
    kind: 'post',
    date: '2026-07-29T21:40:00Z',
    title: {
      en: 'Six players, four hours, one coal shortage',
      zh: '六个人，四小时，一次缺煤',
    },
    image: {
      src: '/media/brass-birmingham.svg',
      alt: {en: 'Canal network abstraction', zh: '运河网络抽象图'},
    },
    summary: {
      en: 'Brass: Birmingham. The rulebook is 12 pages; our house rules are now 3. That is what good design does to arguments.',
      zh: '《伯明翰》。规则书 12 页，我们自己加的补充规则现在有 3 条。好设计对争吵的作用大概就是这样。',
    },
  },
  {
    id: 'dewey-on-habit',
    kind: 'post',
    date: '2026-07-22T08:15:00Z',
    title: {en: 'Re-reading Dewey on habit', zh: '重读杜威谈习惯'},
    image: {
      src: '/media/dewey-on-habit.svg',
      alt: {en: 'Overlapping worn paths', zh: '相互重叠的磨损路径'},
    },
    summary: {
      en: 'His claim that habit is not repetition but a predisposition to a *kind* of response maps disturbingly well onto how we fine-tune models.',
      zh: '他说习惯不是重复，而是对某「一类」回应的倾向性——这个说法套到我们微调模型的方式上，贴合得有点吓人。',
    },
  },
  {
    id: 'eval-suite-four-minutes',
    kind: 'post',
    date: '2026-07-14T12:00:00Z',
    title: {
      en: 'The eval suite runs in under four minutes',
      zh: '评测套件跑进四分钟以内',
    },
    image: {
      src: '/media/eval-suite-four-minutes.svg',
      alt: {en: 'Shrinking bar sequence', zh: '逐渐变短的条形序列'},
    },
    summary: {
      en: 'The trick was not parallelism. It was admitting that 40% of the cases tested the prompt, not the system.',
      zh: '诀窍不是并行，而是承认其中 40% 的用例测的是提示词，不是系统。',
    },
  },
  {
    id: 'support-team-workshop',
    kind: 'post',
    date: '2026-07-02T17:30:00Z',
    title: {
      en: 'Two hours on how the model actually fails',
      zh: '两小时，讲模型到底会怎么出错',
    },
    image: {
      src: '/media/support-team-workshop.svg',
      alt: {en: 'Radiating instruction lines', zh: '向外辐射的讲解线条'},
    },
    summary: {
      en: 'A workshop for our support team. Attendance was optional; everyone came. Nobody has filed a "the AI is broken" ticket since.',
      zh: '给客服团队做的工作坊。自愿参加，结果全员到齐。从那以后再没收到过「AI 坏了」这种工单。',
    },
  },
  {
    id: 'technical-debt-cards',
    kind: 'post',
    date: '2026-06-25T10:10:00Z',
    title: {
      en: 'A card game about technical debt',
      zh: '一个关于技术债的卡牌游戏',
    },
    image: {
      src: '/media/technical-debt-cards.svg',
      alt: {en: 'Fanned cards with a rising curve', zh: '扇形排开的卡牌与上升曲线'},
    },
    summary: {
      en: 'You draw shortcuts, they pay off immediately, and the interest deck shuffles into the draw pile on round four. Playtesters hated round four. Correct.',
      zh: '你抽到的是各种捷径，立刻见效，然后利息牌堆会在第四轮洗进牌库。试玩的人都讨厌第四轮。这就对了。',
    },
  },
  {
    id: 'irish-canals',
    kind: 'post',
    date: '2026-06-18T07:45:00Z',
    title: {en: 'A book on Irish canal engineering', zh: '一本讲爱尔兰运河工程的书'},
    image: {
      src: '/media/irish-canals.svg',
      alt: {en: 'Lock gate cross-section', zh: '船闸剖面'},
    },
    summary: {
      en: 'Every infrastructure project is a bet on a demand curve that has not happened yet. Nothing has changed.',
      zh: '每一个基础设施项目，都是在赌一条尚未发生的需求曲线。这一点从来没变过。',
    },
  },
]);

export const articles: readonly Item[] = chronological([
  {
    id: 'teaching-is-design',
    kind: 'article',
    date: '2026-07-30T00:00:00Z',
    title: {
      en: 'Teaching Is a Design Problem, Not a Content Problem',
      zh: '教育是设计问题，不是内容问题',
    },
    image: {
      src: '/media/teaching-is-design.svg',
      alt: {en: 'Sequenced learning steps', zh: '有次序的学习步骤'},
    },
    summary: {
      en: 'Every course I have disliked had excellent material. The failure was never the content; it was the sequence, the feedback loop, and the refusal to let a learner be wrong in public safely.',
      zh: '我讨厌过的每一门课，材料都很好。失败从来不在内容，而在顺序、反馈回路，以及不肯让学习者安全地在众人面前犯错。',
    },
    body: {
      en: [
        'A syllabus is a UI. It has an information architecture, an error state, and a first-run experience — and almost nobody designs those on purpose.',
        'Start with the error state, because it is where learning actually happens. A course that has no safe way to be wrong will be a course where nobody attempts anything they might fail at, which is to say a course where nobody learns anything hard.',
        'Sequence is the second thing. Material ordered by the structure of the subject is ordered for the person who already knows it. Material ordered by what a learner can do next is ordered for the learner. These are almost never the same order, and the first one is much easier to write.',
        'The feedback loop is the third. If the gap between an attempt and a response is longer than the attention that produced it, the response lands on a different person than the one who made the attempt.',
        'None of this is about content. All of it is design, and it is the part that gets skipped because it does not look like work to the person writing the slides.',
      ],
      zh: [
        '教学大纲就是一个界面。它有信息架构、错误状态和首次使用体验——而几乎没有人是有意识地去设计这些的。',
        '先从错误状态开始，因为学习真正发生的地方就在那里。一门课如果没有一条能安全犯错的路径，学生就不会去尝试任何可能失败的事，也就等于没人学到任何难的东西。',
        '第二是顺序。按学科结构排的材料，是为已经懂的人排的；按学习者下一步能做什么排的材料，才是为学习者排的。这两种顺序几乎从来不重合，而前者好写得多。',
        '第三是反馈回路。如果一次尝试和一次回应之间的间隔，长过产生这次尝试的那份注意力，那么回应落到的已经不是当初那个人了。',
        '这些都与内容无关。全部是设计，而且是最容易被跳过的那部分——因为在写幻灯片的人看来，它不像是在干活。',
      ],
    },
  },
  {
    id: 'underwriting-an-agent',
    kind: 'article',
    date: '2026-06-11T00:00:00Z',
    title: {
      en: 'Underwriting an Agent: What Fintech Taught Me About Autonomy',
      zh: '给 Agent 做核保：金融科技教会我的自主性边界',
    },
    image: {
      src: '/media/underwriting-an-agent.svg',
      alt: {en: 'Decision gate with a paper trail', zh: '带审计链的决策关口'},
    },
    summary: {
      en: 'Credit teams spent forty years answering the question the AI industry is asking now: how much authority do you hand to a process you cannot fully inspect? The answer is a paper trail, not a benchmark.',
      zh: '信贷团队用四十年回答了 AI 行业现在才开始问的问题：你能把多少权限交给一个你无法完全检查的流程？答案是一条可追溯的记录链，而不是一个跑分。',
    },
    body: {
      en: [
        'Underwriting is the discipline of deciding how much you trust a judgement you did not make. It is older than machine learning by a century, and it solved a version of the problem the AI industry currently frames as new.',
        'The credit answer is not "measure the model until you trust it". It is: bound the decision, record why it was made, and make the record legible to someone who will read it a year later under adversarial conditions.',
        'That third clause is the one engineers skip. A log written for debugging is not a paper trail. A paper trail is written for a reader who assumes you were wrong and wants to find out where.',
        'Applied to an agent, this means the interesting artifact is not the eval score. It is the per-decision record: what it retrieved, which policy it checked, what a human signed off on and when.',
        'Autonomy then becomes a dial rather than a property. The question stops being "is the agent good enough" and becomes "what is it allowed to decide alone, and what does it have to hand up" — which is a question a business can actually answer.',
      ],
      zh: [
        '核保这门手艺，处理的正是「你有多信任一个不是你做出的判断」。它比机器学习早了整整一个世纪，而且已经解决过 AI 行业如今当作新问题的那个版本。',
        '信贷给的答案不是「把模型测到你信为止」，而是：给决策划定边界，记录它为什么这么定，并且让这份记录在一年后、在有人带着敌意来查的情况下依然读得懂。',
        '第三句是工程师最容易跳过的。为调试而写的日志不是审计链。审计链是写给一个默认你错了、正要找出错在哪的读者看的。',
        '放到 Agent 上，这意味着值得留下的东西不是评测分数，而是逐次决策的记录：它检索了什么、校验了哪条策略、谁在什么时候签的字。',
        '于是自主性变成一个旋钮，而不是一个属性。问题不再是「这个 Agent 够不够好」，而是「它可以自己决定什么，什么必须交上来」——后者是一家公司真的能回答的问题。',
      ],
    },
  },
  {
    id: 'intention-is-not-a-prompt',
    kind: 'article',
    date: '2026-05-02T00:00:00Z',
    title: {en: 'Intention Is Not a Prompt', zh: '意图不是提示词'},
    image: {
      src: '/media/intention-is-not-a-prompt.svg',
      alt: {en: 'Diverging arrows from one origin', zh: '自同一起点发散的箭头'},
    },
    summary: {
      en: 'Anscombe asked what makes an action intentional. Forty years of philosophy of action turns out to be an unusually good spec document for anyone building systems that act on a person\'s behalf.',
      zh: 'Anscombe 追问的是：什么让一个行动成为「有意图的」。四十年的行动哲学，恰好是一份异常好用的规格说明书——对任何在为他人代行事的系统而言。',
    },
    body: {
      en: [
        'Anscombe\'s test for an intentional action is whether the question "why did you do that?" has an answer of a particular kind — one that gives a reason rather than a cause.',
        'That distinction is exactly the one missing from most agent architectures. A trace tells you the cause of an action: this token, then this tool call. It does not tell you the reason, and a reason is what a user is asking for when something surprising happens.',
        'The practical consequence is that intent has to be a first-class object in the system, not a string that got interpolated into a prompt and then thrown away.',
        'If you keep it, you can check an action against it. If you throw it away, the best you can do afterwards is reconstruct a plausible story, which is what an incident report written from logs alone always is.',
      ],
      zh: [
        'Anscombe 判断一个行动是否「有意图」的方法，是看「你为什么这么做」这个问句有没有一种特定的答案——给出理由，而不是给出原因。',
        '这个区分恰好是多数 Agent 架构里缺的那个。一条 trace 告诉你行动的原因：这个 token，然后这次工具调用。它不告诉你理由，而当意外发生时，用户要的正是理由。',
        '实际后果是：意图必须成为系统里的一等对象，而不是一个被插进提示词、然后就被扔掉的字符串。',
        '留着它，你就能拿一次行动去对照它；扔掉它，事后你最多只能重建一个说得通的故事——只靠日志写出来的事故报告，从来都是这种东西。',
      ],
    },
  },
  {
    id: 'four-person-platform-team',
    kind: 'article',
    date: '2026-03-19T00:00:00Z',
    title: {en: 'The Four-Person Platform Team', zh: '四个人的平台团队'},
    image: {
      src: '/media/four-person-platform-team.svg',
      alt: {en: 'Four nodes holding a frame', zh: '四个节点撑起的框架'},
    },
    summary: {
      en: 'What a startup platform team should refuse to build, and how to say no in a way that survives the next funding round.',
      zh: '创业公司的平台团队应该拒绝造什么，以及怎样把「不做」说得能撑过下一轮融资。',
    },
    body: {
      en: [
        'A four-person platform team can own about three things well. The job is choosing which three, and then defending the choice against every reasonable-sounding request that would make it four.',
        'The refusals that hold are the ones with a stated reason attached to a number: we do not run this because it would take one of four people permanently, and here is what that person is doing instead.',
        'The refusals that collapse are the ones phrased as taste. "That is not our job" is an opinion, and opinions get overruled the quarter after the person who held them leaves.',
      ],
      zh: [
        '四个人的平台团队大概能把三件事做好。工作就是选出哪三件，然后在每一个听起来都很合理、但会让它变成四件的请求面前守住这个选择。',
        '守得住的拒绝，是带着理由和数字的：我们不做这个，因为它会长期占掉四个人里的一个，而这个人现在正在做的是这件事。',
        '守不住的拒绝，是说成品味的。「这不是我们的活」是个观点，而观点会在持有它的人离职后的那个季度被推翻。',
      ],
    },
  },
  {
    id: 'how-to-read-a-rulebook',
    kind: 'article',
    date: '2025-11-08T00:00:00Z',
    title: {en: 'How to Read a Rulebook', zh: '怎么读一本规则书'},
    image: {
      src: '/media/how-to-read-a-rulebook.svg',
      alt: {en: 'Numbered rule blocks', zh: '编号的规则块'},
    },
    summary: {
      en: 'Board game rulebooks are the most ruthlessly tested technical documents in the world. Here is what they do that our engineering docs do not.',
      zh: '桌游规则书是世界上被测试得最狠的技术文档。这里说的是它们做对了、而我们的工程文档没做的那些事。',
    },
    body: {
      en: [
        'A rulebook is read once, under time pressure, by people who want to start playing. If it fails, the failure is immediate and loud: five people around a table, arguing.',
        'That feedback loop produces conventions our documentation never developed. Worked examples adjacent to the rule rather than in an appendix. An explicit turn structure before any of the details. A glossary that is normative, not descriptive.',
        'The one worth stealing first is the turn structure: state the loop, then fill it in. Most engineering docs describe components and leave the reader to infer the loop, which is the one thing they actually needed.',
      ],
      zh: [
        '规则书只会被读一次，在有时间压力的情况下，读的人只想赶快开局。它一旦失败，失败是即时且响亮的：五个人围着桌子吵起来。',
        '这种反馈回路催生了一些我们的文档从未发展出的惯例：例子紧挨着规则本身而不是塞进附录；在任何细节之前先给出明确的回合结构；术语表是规范性的，不是描述性的。',
        '最值得先偷过来的是回合结构：先讲清楚那个循环，再往里填。多数工程文档描述的是一个个组件，把循环留给读者自己推——而循环恰恰是读者唯一真正需要的东西。',
      ],
    },
  },
]);

export const works: readonly Item[] = chronological([
  {
    id: 'intentplex',
    kind: 'work',
    date: '2026-08-15T00:00:00Z',
    title: {en: 'intentplex', zh: 'intentplex'},
    image: {
      src: '/media/intentplex.svg',
      alt: {en: 'Two mirrored text columns', zh: '两栏互为镜像的文字'},
    },
    summary: {
      en: 'This site. Every string is authored in both languages at once, so a half-translated page is a type error rather than a discovery.',
      zh: '这个网站。每一段文案都在同一处同时用两种语言写好，于是「翻译到一半」是类型错误，而不是上线后才发现的问题。',
    },
    body: {
      en: [
        'Built on TanStack Start with Astryx and StyleX, no Tailwind and no hand-written CSS beyond a nine-line stylesheet that declares the cascade order.',
        'The interesting constraint is that every colour, size, radius and font resolves to a design-system token, enforced by making the token registry the only file allowed to name one.',
        'The bilingual guarantee is a type, not a process: copy lives as {en, zh} objects, so the compiler is what notices a missing translation.',
      ],
      zh: [
        '基于 TanStack Start，配 Astryx 与 StyleX，没有 Tailwind，除了一份声明层叠顺序的九行样式表之外没有任何手写 CSS。',
        '有意思的约束是：每一个颜色、尺寸、圆角和字体都必须落到设计系统的 token 上——做法是让 token 注册表成为整个仓库里唯一被允许写出 token 名字的文件。',
        '双语保证是一个类型，不是一道流程：文案以 {en, zh} 对象存在，于是发现漏翻译的是编译器。',
      ],
    },
  },
  {
    id: 'rulesmith',
    kind: 'work',
    date: '2025-09-02T00:00:00Z',
    title: {en: 'Rulesmith', zh: 'Rulesmith'},
    image: {
      src: '/media/rulesmith.svg',
      alt: {en: 'Rule graph with a dead end', zh: '带死路的规则图'},
    },
    summary: {
      en: 'A linter for board game rulebooks. Parses one into a state machine and reports unreachable rules, undefined terms, and turn phases with no exit condition.',
      zh: '一个给桌游规则书用的 linter。把规则书解析成状态机，报告不可达规则、未定义术语，以及没有退出条件的回合阶段。',
    },
    body: {
      en: [
        'Designers use it. Publishers pretend they do not.',
        'The parser is the boring part; the interesting part was deciding what counts as a rule. A rulebook sentence can be normative, illustrative, or flavour, and only the first kind belongs in the graph.',
        'The check that finds the most real bugs is the simplest one: a phase with no exit condition. It has caught something in every rulebook it has been pointed at, including two that were already in print.',
      ],
      zh: [
        '设计师在用，出版方装作没在用。',
        '解析器是无聊的那部分；有意思的是判定什么才算一条规则。规则书里的一句话可能是规范性的、示例性的，或者只是氛围文案，只有第一类该进图里。',
        '找出真问题最多的反而是最简单的那条检查：一个没有退出条件的阶段。它在每一本被指过的规则书里都抓到了东西，包括两本已经付印的。',
      ],
    },
  },
  {
    id: 'socratic-deck',
    kind: 'work',
    date: '2025-04-18T00:00:00Z',
    title: {en: 'Socratic Deck', zh: 'Socratic Deck'},
    image: {
      src: '/media/socratic-deck.svg',
      alt: {en: 'A card face turned away', zh: '一张背过身去的卡片'},
    },
    summary: {
      en: 'Spaced repetition that asks instead of tells. Cards refuse to show the answer until you have written a wrong one.',
      zh: '会提问而不是告知的间隔重复。在你写下一个错误答案之前，卡片不会给你正确答案。',
    },
    body: {
      en: [
        'Retention went up 40% in a small classroom trial. Frustration went up considerably more.',
        'The design bet is that the cost of retrieval is the thing that makes a memory stick, and that a card which shows its answer on request has quietly removed that cost.',
        'It is not a pleasant tool and I would not recommend it to someone who is not already convinced. That is probably why it stayed in beta.',
      ],
      zh: [
        '小范围课堂试验里记忆留存提升了 40%，挫败感提升得更多。',
        '这个设计押的是：让记忆留下来的正是提取时付出的代价，而一张随叫随到就给答案的卡片，等于悄悄把这个代价拿掉了。',
        '它不是一个愉快的工具，我也不会推荐给还没被说服的人。大概这就是它一直停在 beta 的原因。',
      ],
    },
  },
  {
    id: 'ledgerlens',
    kind: 'work',
    date: '2024-10-07T00:00:00Z',
    title: {en: 'LedgerLens', zh: 'LedgerLens'},
    image: {
      src: '/media/ledgerlens.svg',
      alt: {en: 'Transaction bands over time', zh: '随时间铺开的交易带'},
    },
    summary: {
      en: 'An open dataset and viewer for anonymised SME transaction patterns. Built for a talk, kept alive because three universities started teaching from it.',
      zh: '一个开放数据集和查看器，展示脱敏后的中小企业交易模式。本来是为一次演讲做的，因为有三所大学拿它当教材就留了下来。',
    },
    body: {
      en: [
        'The dataset is the product; the viewer exists so the dataset can be looked at without writing code first.',
        'Anonymisation was most of the work, and the part I would do differently is the part I thought was finished first — aggregate shapes leak more than you expect when the population is small.',
      ],
      zh: [
        '数据集才是产品；查看器存在的意义，只是让人不必先写代码才能看这份数据。',
        '脱敏占了绝大部分工作量，而我最想重做的恰恰是当初以为最先做完的那部分——样本量小的时候，聚合形状泄露的东西比你预期的多。',
      ],
    },
  },
  {
    id: 'marginalia',
    kind: 'work',
    date: '2023-06-30T00:00:00Z',
    title: {en: 'Marginalia', zh: 'Marginalia'},
    image: {
      src: '/media/marginalia.svg',
      alt: {en: 'Highlights linked into a graph', zh: '连成图的划线'},
    },
    summary: {
      en: 'Public reading notes with an argument graph. Every highlight had to be linked to a claim it supported or attacked.',
      zh: '带论证图的公开读书笔记。每一条划线都必须连到它支持或反驳的某个论点上。',
    },
    body: {
      en: [
        'It made me read better and post less. Archived when I admitted those were the same thing.',
        'The constraint worked exactly as intended, which is the problem: a tool that makes an activity more expensive will reduce how much of it you do, and I had not decided whether that was the goal.',
      ],
      zh: [
        '它让我读得更好、发得更少。当我承认这两件事是同一件事之后，就归档了。',
        '这个约束完全按设计生效了，问题也正在这里：一个让某项活动变贵的工具，一定会让你做得更少，而我当初没想清楚那到底是不是目的。',
      ],
    },
  },
  {
    id: 'tempo',
    kind: 'work',
    date: '2022-11-14T00:00:00Z',
    title: {en: 'Tempo', zh: 'Tempo'},
    image: {
      src: '/media/tempo.svg',
      alt: {en: 'A countdown fading out', zh: '逐渐淡出的倒计时'},
    },
    summary: {
      en: 'A standup tool that deleted itself after 90 days, written to test whether a team ritual survives without its tooling.',
      zh: '一个 90 天后自我删除的站会工具，写它是为了验证一个团队仪式在失去工具后能不能活下来。',
    },
    body: {
      en: [
        'It did. That was the whole finding, so the project ended.',
        'The self-deletion was not a gimmick — it was the experiment. A tool you can keep using is a tool whose necessity you never test.',
      ],
      zh: [
        '结果是能。这就是全部结论，所以项目结束了。',
        '自我删除不是噱头，它就是实验本身。一个你可以一直用下去的工具，是一个你永远不会去检验其必要性的工具。',
      ],
    },
  },
]);

/** The home feed: everything, newest first. */
export function recentItems(limit: number): readonly Item[] {
  return chronological([...posts, ...articles, ...works]).slice(0, limit);
}

/** Detail-page lookup. Only articles and works have one. */
export function findItem(kind: 'article' | 'work', id: string): Item | undefined {
  return (kind === 'article' ? articles : works).find((item) => item.id === id);
}

/** Where an item's detail page lives, or null when it has none. */
export function itemHref(item: Item): string | null {
  if (item.kind === 'article') return `/articles/${item.id}`;
  if (item.kind === 'work') return `/works/${item.id}`;
  return null;
}
