# Handoff — INTENTPLEX-3 把内容改成 Markdown 并导入 LinkedIn 存量

自主开发（cap3），首次交付。`Finish: review`，人已在验收后同意关单。

## 改了什么

**内容层：TypeScript 字面量 → 仓库里的 Markdown + frontmatter**

| 文件 | 内容 |
|---|---|
| `content/{posts,articles,works}/*.md`（新，180 个） | 全部内容。文件名 `<YYYY-MM-DD>-<slug>[.<lang>].md`，frontmatter 带 title / date / lang / image / source |
| `src/content/validate.ts`（新） | 字段规则的唯一定义。loader 与构建期插件共用 |
| `src/content/loader.ts`（新） | `import.meta.glob` 全量读入，按 slug 归组成 `Item`，导出 posts / articles / works / recentItems / findItem / pickRendition / leadOf |
| `src/content/items.ts` | 删除 |
| `vite.config.ts` | 新增 `intentplex:content-validation` 插件，`buildStart` 时校验每个 md 文件 |
| `src/components/PostList.tsx`（新） | posts 专用：`CollapsibleGroup` 就地展开 |
| `src/components/{ItemList,ItemDetail,ItemPage}.tsx` | 接新 loader；详情页改用 Astryx 的 `Markdown` 组件 |
| `package.json` | `+front-matter`（`gray-matter` 装了又卸，原因见下） |

**双语从「必须成对」放宽为「至少一种语言」.** `Item.renditions` 按 locale 存，`pickRendition`
取不到当前语言时回退到原文并返回 `isFallback`，页面据此标注「暂无中文版，以下为原文」。
补翻译的动作是**在旁边加一个 `<slug>.zh.md`**——AC 里实测过，加完直接构建通过，不动结构不动代码。

**导入的存量**：156 条原创帖、12 篇文章全文、143 张图片本地化到 `public/media/linkedin/`。
works 的 6 条保留，转成 Markdown，中英双份。

## 三个真缺陷，都是这一轮抓出来的

**一、`gray-matter` 会让整站失去交互。** 它调用 Node 的 `Buffer`，浏览器里不存在。内容加载器
在服务端和客户端都要跑，所以 `parseAll()` 在**水合时抛异常**——语言切换、导航、折叠，全都不
响应。而 SSR 在 Node 里正常，页面看起来毫无问题，截图也看不出来。换成 `front-matter`
（11KB，1 个依赖，无 Node API）。这也是折叠面板"点不开"的真正原因，我一度以为是组件用法错了。

**二、转发混进了原创。** 第一次导入 229 条，其中 **73 条是别人的内容**。两个原因叠加：
`entityUrn` 里的 `MEMBER_SHARES` **不代表本人所写**（转发也带），而 reshare 引用的键是
`*resharedUpdate`——带星号前缀，无星号的键恒为 `undefined`，所以 `!u.resharedUpdate` 在它唯一
该拦截的对象上永远通过。另有一类转发（转发公司页）根本没有该引用，只能靠 `actor.name` 与
`header`（"X reposted this"）识别。正确判据是三者同时成立。修正后 231 条活动里 156 条原创。

**三、第 12 篇文章漏抓。** 我把第一次枚举到的 11 个 URL 硬编码进了批量抓取，之后一次探测返回
`urlCount: 12` 我没回头核对。现在改成页面 URL 集合双向差集 + LinkedIn 自报的 `Loaded N Articles`
交叉验证。这是我的操作错误，不是抓取器的缺陷。

## AC 结果

`node .intentfold/tickets/INTENTPLEX-3/tmp/ac.mjs`，dev server 53003，desktop 1280×800 与
mobile 390×844，有头模式。**16/16 通过**，截图在同目录。

| 标准 | 证据 |
|---|---|
| **AC1** 真实内容、倒序、数量一致 | posts 156/156、articles 12/12，两者日期序列均非递增；行数与 `content/` 下的 md 文件数相等 |
| **AC2** 详情页 Markdown 结构正确 | 13 个段落、5 个结构元素（标题/列表/链接/加粗），且页面上不出现未解析的 Markdown 字面量 |
| **AC3** 只动 Markdown + 缺字段构建失败 | `src/` 下搜不到任何条目标题；造一个缺 `date` 的文件后构建**退出码 1** 并指名 `ac-schema-probe.md` 缺 `date` |
| **AC4** 单语可读且标注 / 补翻译免改结构 | 中文界面下有「暂无中文版」标注，正文 196 字可读；新增一个 `.zh.md` 后构建干净通过 |
| **AC5** 中英两种语言 | 中文导航、156 行、序号都在（移动端需先展开 AppShell 抽屉） |
| **rework** 折叠与行内容 | 展开后 `aria-expanded=true`、内容可见、**引子被撤掉**；156 行**无一空行**，124 个缩略图 |

**跑出过 5 个 FAIL，全部是检查本身的问题**，按 `charter/qa.md` 先判性质再改：

1. `p.astryx-text` 计数为 0 → Astryx 的 `Markdown` 用自己的语义（段落是
   `div.astryx-markdown-paragraph`，标题是 `h*.astryx-markdown-heading`）。断言 `<p>` 什么也
   找不到，也什么都不说明。
2. AC3 误报 → grep 的 `kind: '(post|article|work)'` 匹配到了**类型联合**，那是声明不是内容。
   改成搜真实文章标题。
3. mobile 中文导航计数为 0 → 768px 以下导航在抽屉里。
4. 打开抽屉后 → 它是 `<dialog>`，背景层吞掉了后续所有点击。用完必须 Escape 关掉。

## 与 plan.md 的偏差

- **frontmatter 解析器换了两次。** 计划里列了三个候选，先选 `gray-matter`（最流行）——被
  `Buffer` 问题否掉，改用 `front-matter`。人的批准条件是「流行、现成、轻量」，两者都满足。
- **posts 的呈现方式**在 rework 中从纯列表改成 `CollapsibleGroup`，是人在验收过程中提的。
- 其余按计划执行。

## 环境

- 端口 **53003**，dev server 仍在运行（关单时停）。
- **没有任何 env key 变更**，cap4 无需回写。
- Playwright 仍用 `npm i --no-save` 装在本机，**未提交**（见 Residual）。

## Residual

1. **`public/media/linkedin/` 是 57MB。** 143 张图取的是 LinkedIn 的最大尺寸原图（平均 400KB）。
   进仓库偏重，也会让容器镜像变大。CDN 的 `artifacts` 里有 480–800px 的中等尺寸，体积约十分
   之一。已两次向人提出，人未表态，按现状交付。
2. **文章标题带 LinkedIn 痕迹**，例如最早一篇结尾是 `(Original + Claude)`。已向人提出，未表态。
3. **posts 的 17 条**展开后没有新内容（短、单段、无图），其余 139 条有更多正文或图片。
4. **Playwright 仍未进 `package.json`**（`charter/arch.md` 红线 2，本次依赖批准只覆盖
   frontmatter 解析器）。第三次记录了。
5. **charter 漂移，机器不自行修改**：
   - `charter/ui.md` 的「Content and tone」写着「每条文案都以 L10n 成对书写」，本工单已把它
     放宽为「至少一种语言」。
   - `charter/arch.md` 的 Structure 一节说内容是 `src/content/` 下的静态 TypeScript，现在是
     仓库根目录的 `content/**/*.md`。
   - `charter/runbook.md` 与 `arch.md` 的生产启动命令漂移（INTENTPLEX-1 起就记录着，仍未处理）。
