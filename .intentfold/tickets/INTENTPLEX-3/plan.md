# Plan — INTENTPLEX-3 把内容改成 Markdown 并导入 LinkedIn 存量

## 前提探测的结果（写这份计划之前先去看了真实账号）

| 探测项 | 结果 |
|---|---|
| Chrome 插件 / 登录态 | ✅ 已连接，已登录，handle 是 `chonghuan`，档案名 **Chonghuan Wang** |
| Articles | ✅ **11 篇**，全部是 `/pulse/` 链接，可用 `a[href*="/pulse/"]` 一次枚举干净。每篇有独立页面，正文完整 |
| Posts | ⚠️ LinkedIn 自己报 **"Loaded 20 Posts posts"**，但 DOM 里**只渲染 5 条**。窗口滚动到底反复 60 次，`domCount` 纹丝不动停在 5，`scrollHeight` 也没变 |
| `/recent-activity/posts/` | ⚠️ **访问不到**。无论用导航还是 `location.replace`，都被弹回 `/articles/`。posts 只能从 `/all/` 进 |
| 日期 | ✅ **已解决且无需逐条开页**。LinkedIn 的 activity URN 前 41 位就是创建时间戳，实测三条解出 2026-08-13 / 08-12 / 08-11，与倒序一致 |
| 图片 | ✅ 帖子节点里有 `licdn` 图片，可取 |
| SPA 行为 | ⚠️ LinkedIn 会吃掉 URL 跳转，抓取器必须走硬刷新而不是 SPA 导航 |

**唯一没跑通的是 posts 的完整枚举**，这是纯抓取路线的第一处真实摩擦，进 grill。

## 路线

### 第一部分 — 内容改成 Markdown + frontmatter（与 LinkedIn 无关，可独立完成）

```
content/
  posts/2026-08-13-<slug>.md
  articles/2026-07-30-<slug>.md
  works/2026-08-15-<slug>.md
```

文件名带日期便于按时间浏览目录；真相仍然是 frontmatter 里的 `date`。

frontmatter 形状，为「日后补翻译」留位置：

```yaml
---
title: Don't Ask AI to Write Tests
date: 2026-08-13T07:32:52Z
lang: en                 # 这个文件的语言
image: /media/xxx.svg
source: https://www.linkedin.com/pulse/...   # 原文出处，可空
---
```

**补翻译的路径是「加一个文件」**：`<slug>.zh.md` 与 `<slug>.en.md` 并列，加载器按 slug 归组。
不改结构、不改代码、不迁移文件——满足工单 Constraints。

加载器 `src/content/loader.ts`：`import.meta.glob('/content/**/*.md', {eager:true, query:'?raw'})`
构建期全量读入 → 解析 frontmatter → 按 slug 归组成 `Item` → schema 校验（必填 title/date/lang，
缺就 **throw**，让构建失败）。渲染用 Astryx 的 `Markdown` 组件（接受 markdown 字符串，
`headingLevelStart` 可以把 `#` 压到 h2 以下，正好适配详情页已有的 h1）。

`Item` 类型改动：`title`/`summary`/`body` 从 `L10n<T>`（强制双语）变成
`Partial<Record<Locale, T>>` + 一个「至少一种语言」的构造期保证。界面取不到当前语言时回退到
原文并标注。

**frontmatter 解析器**：人已批准新增依赖，要求流行、现成、轻量。候选在 grill 前实测：
`gray-matter`（最流行，但传递依赖较多）、`front-matter`（零依赖，只解析 YAML 子集）、
`vfile-matter`。选型连同下载量/依赖数/体积一起过给人。

### 第二部分 — 写 ips-linkedin（仓库外，不属于本工单）

放在 `~/.claude/skills/ips-linkedin/`，与 ips-xhistory 同级。能力：

1. `articles` — 枚举 11 篇的 URL/标题，逐篇打开 `/pulse/` 页取正文与日期
2. `posts` — 从 `/all/` 枚举，取 URN、正文、图片；日期由 URN 解出
3. 输出统一的 JSONL 到本地，供本工单的导入脚本消费

它不产生本仓库的提交。

### 第三部分 — 导入

一个一次性脚本（放 ticket 的 `tmp/`，不提交）把 JSONL 转成 Markdown 文件，图片下载到
`public/media/`。导入结果是**提交的内容**，脚本本身不是。

## 红线查询（写代码之前）

| 动作 | 命中条目 | 结论 |
|---|---|---|
| 新增 frontmatter 解析依赖 | `arch.md` 2 | **已获批准**，人原话「用流行的、现成的、轻量级的」，已记入工单评论 |
| 新增 `content/**/*.md` 与 `src/content/loader.ts` | `arch.md` 1（内容层不得 import React/组件） | 遵守：Markdown 是纯文本，loader 只解析不渲染 |
| 引入数据源 | `arch.md` 4（不得引入数据库或服务端数据源） | 不触发：全部在构建期解析完，运行时无数据源 |
| 放宽双语不变量 | `ui.md` 的 Content and tone 一节写着「每条文案都以 L10n 成对书写」 | **这是 charter 漂移**，由本工单造成。机器只报告不自行修改，写进 handoff |
| 抓取 LinkedIn | 无 charter 条目 | 只抓本人账号下自己发布的内容 |
| 删除现有 mock 内容 | 无 | 进 grill，由人决定 works 那 6 条怎么处理 |

## 进 grill 的问题

1. **posts 只枚举到 5/20** — 纯抓取路线的真实阻碍，怎么办
2. `/all/` 里混着转发与评论，「我的所有 posts」是否只要原创
3. 站点署名现在是 **Yong Wang**，LinkedIn 档案是 **Chonghuan Wang**，以哪个为准
4. 现有 mock 内容（8 posts / 5 articles / 6 works）怎么处理，尤其 **works 那 6 条 LinkedIn 上没有**
