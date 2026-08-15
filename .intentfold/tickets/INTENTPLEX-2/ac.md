# AC — INTENTPLEX-2

工单的验收标准是权威来源，本文件只是可执行的检查计划。全部跑在本工单端口 **53002** 的 dev
server 上（`npm run dev -- --port 53002`，见 `charter/runbook.md`），两个视口都跑：
desktop 1280×800、mobile 390×844（`charter/qa.md` 要求）。

```bash
node .intentfold/tickets/INTENTPLEX-2/tmp/ac.mjs
```

已知且要排除的噪声：站点没有 favicon，浏览器对 `/favicon.ico` 的隐式请求会记一条 404
console error。这条早于本工单（INTENTPLEX-1 的 handoff 已记录），按 console 消息的
`location().url` 排除；其余任何 error 或含 `hydrat` 的警告都算失败。

## AC1 — 五个入口可达且对应正确，topbar 实色不透明

**怎么查.** 依次点顶栏 Posts / Articles / Works / Contacts / Home，每次断言 URL 与页面 h1。
再读顶栏容器的 computed `background-color`，断言它**不是** `transparent` 也不是
`rgba(…, 0)`——这是人明确选的那一条。

**什么算通过.** 五次跳转的 URL 与 h1 都对得上；顶栏背景 alpha 大于 0。

## AC2 — 首页只有 hero 和「最近动态」两块

**怎么查.** 打开 `/`，断言：
1. h1 文本等于 `Intents × AI = New world`；
2. 自我介绍段落里含 `harness engineering`（英文）；
3. 页面里 h2 只有一个，且文本是 `Recent`；
4. 主内容区里的列表（`.astryx-list`）只有一个。

第 3、4 条是「没有其他板块」的可判定形式——旧首页有三个 h2 和多种容器，任何一块回来都会
让这两条失败。

**什么算通过.** 四条全成立。

## AC3 — 三页各是纯倒序列表，条目图文并存，页面上没有别的东西

工单 AC3 原本要求「由条目汇总的筛选标签」。人在 rework 时明确改成**全部去掉，连筛选也不要**，
工单描述与评论已同步更新。下面是改后的检查。

**怎么查.** 对 `/posts`、`/articles`、`/works` 各做一遍：
1. 读所有列表行的日期，断言是**非递增**序列（倒序）；
2. 断言每一行都有一个 `img` 且其 `naturalWidth > 0`（图真的加载了，不是坏图标），同时有非空
   的标题文字——这就是「图片和文字的结构」；
3. 断言页面上**没有任何 `ToggleButton`**（`.astryx-toggle-button` 计数为 0）——筛选确实没了；
4. 断言页面结构就是「一个 h1 + 一个列表」：h1 恰好一个、`.astryx-list` 恰好一个，
   h2/h3 一个都没有。

第 3、4 条是「极简」的可判定形式：任何一块东西回来都会让它们失败。

**什么算通过.** 三页的四条都成立。

## AC4 — articles 与 works 可进详情页，posts 不可

**怎么查.**
1. `/articles` 点第一行 → 断言 URL 变成 `/articles/<slug>`，页面出现「Back」链接、h1、
   以及至少两个正文段落；
2. `/works` 同样；
3. `/posts` 的行断言**没有** `href`（`ListItem` 不给 href 时不会渲染锚点）。

**什么算通过.** 两次都进得去且有正文；posts 的行不可点。

## AC5 — 以上在中英两种语言下都成立

**怎么查.** 切到「中文」后重跑 AC1 的导航断言与 AC3 的倒序/图文断言，并断言：
- 顶栏出现 `动态`、`文章`、`作品`、`联系`；
- 首页 h2 是 `最近动态`，自我介绍里含 `Harness engineering`；
- 筛选标签渲染中文（例如 `工程`、`桌游`）。

**什么算通过.** 上述断言在中文下全部成立。
