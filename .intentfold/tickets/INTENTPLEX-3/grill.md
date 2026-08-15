# Grill — INTENTPLEX-3

工单 `Grill: human`。用批量提问工具一次问了四题，而不是 n-grill 的逐题访谈——同一个功能
（写代码前与人对齐一次），往返少得多。以下是问题、人的回答，以及提问前后的探测依据。

## 人的四个决定

| 问题 | 回答 |
|---|---|
| posts 只枚举到 5/20 怎么办 | **继续深挖**，并且「看看 ips-xhistory 试了多少种不同的方法，最后如何取得突破，学习一下」 |
| 「我的所有 posts」包括哪些 | **只要原创帖子**。转发、评论、点赞都排除 |
| 站点署名 | **保持 Yong Wang**，不因 LinkedIn 档案叫 Chonghuan Wang 而改 |
| 现有 mock 内容 | **posts / articles 全替掉，works 保留**（LinkedIn 上没有 works，那 6 条继续用现有的） |

## 第一题的落地：去 ips-xhistory 取经，然后突破

人让我先去读那个技能。它的 `references/dead-ends.md` 直接解释了我卡住的原因，而
`SKILL.md` 给出了正确路线。三条关键教训，全部在 LinkedIn 上复现：

**1. 页面内 JS 的 `scrollTo` 根本不触发分页。** dead-ends 原话：「A loop written in page JS
looks like it reaches the bottom after a handful of items — that is this, not the end of the list.」
我之前那个 60 次滚动循环看到 `domCount` 死死停在 5，正是这个坑，不是列表到底了。真实的 CDP
输入（`computer` 工具的 `scroll`）才算数。

**2. 别抓 DOM，replay 站点自己的 API。** X 那边 DOM 几十次调用拿 98 条，GraphQL replay 四次拿
5019 条。LinkedIn 同构：它的 SPA 走 **Voyager API**。

**3. 注入 `window.fetch` 钩子抓不到东西**（站点在 bundle 初始化时就抓走了自己的 fetch 引用），
必须用 `read_network_requests`，而且**它从第一次调用才开始记录**——先调用，再触发请求。

按这个顺序做，捕获到了端点：

```
/voyager/api/graphql?includeWebMetadata=true
  &variables=(count:100,start:0,profileUrn:urn:li:fsd_profile:<id>)
  &queryId=voyagerFeedDashProfileUpdates.<hash>
```

`count` / `start` 分页。实测 replay `count:100` 一次返回 **100 个 elements、574 个 included
对象**，而同一页面的 DOM 只渲染 5 条。**posts 枚举问题就此解决**，`grep`-DOM 那条路彻底放弃。

`queryId` 里的 hash 会随 LinkedIn 构建变化，和 X 的 `queryId` 一样**必须每次现抓，不能写死**。

## 其余的前提探测（提问之前就做完的）

| 探测项 | 结果 |
|---|---|
| 插件 / 登录态 | ✅ 已连接，已登录，handle `chonghuan` |
| Articles | ✅ 11 篇，`a[href*="/pulse/"]` 枚举干净，各有独立页面带完整正文 |
| 日期 | ✅ LinkedIn 的 activity URN 前 41 位即创建时间戳。实测解出 2026-08-13 / 08-12 / 08-11，与倒序一致，**无需逐条开页** |
| `/recent-activity/posts/` | ⚠️ 访问不到，总被弹回 `/articles/`。只能从 `/all/` 或 API 进 |
| SPA 导航 | ⚠️ 会吃掉 URL 跳转，必须硬刷新 |

## 折回 plan.md / ac.md 的内容

- plan 第二部分「写 ips-linkedin」的路线从 DOM 抓取改为 **Voyager API replay**，DOM 只保留给
  articles 的正文抓取（那 11 篇各有独立页面，不涉及虚拟列表）。
- `count:100` 返回的 100 条是**全部活动**，含转发与评论。按人的回答，导入前要**过滤出原创帖子**。
  过滤依据待实现时从 element 结构里确定，这是实现细节不是设计决定。
- ac.md 的 AC1「数量一致」现在有了可核对的基准：articles 11 篇；posts 的目标数 = API 返回里
  原创帖子的条数，抓取报告要同时给出总活动数与过滤后的原创数。
- works 栏目保留现有 6 条 mock，AC 不对它断言。
- 站点署名不动，`site.ts` 无需改。

## 没有命中红线

依赖新增已获人批准（frontmatter 解析器）。抓取只读本人账号下自己发布的内容，不写入、不代发。
