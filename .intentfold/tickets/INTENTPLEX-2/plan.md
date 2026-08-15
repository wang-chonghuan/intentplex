# Plan — INTENTPLEX-2 重做整站信息架构与页面结构

## 代码里读到的、工单没说的事

- 现在五个页面各自长成一个样子：首页是 hero + 三个板块，essays 是「精选卡片 + 存档列表」，
  work 是「KPI 磁贴 + 卡片网格」，media 是「主渠道卡片 + 次要行列表」，posts 是唯一一个已经
  接近纯列表的。工单要的是**五个页面共用一种结构**，所以这次不是改样式，是把四种结构收敛成一种。
- 现有内容文件每个页面一套自己的类型（`Essay`、`Project`、`Post`、`Channel`），字段互不相同。
  要做「首页最近动态」这种跨类合并的列表，必须先有一个统一的条目类型，否则合并处要写四个分支。
- `posts.ts` 现在的筛选是写死的 `FILTERS = ['all','build','read','teach','play']` 加一个
  `topics` 枚举。工单明确要求标签由条目自身汇总生成，这份枚举要拆成两半：**哪些标签存在**由
  数据推导，**标签怎么翻译**仍然需要一份字典。
- 仓库里没有 `public/` 目录，也没有任何图片资源。工单要求 posts / articles / works 都支持图文
  结构，所以需要占位图。
- `AppShell` 的 `variant` 现在是 `section`（导航区带分割线）。工单原话对 topbar 自相矛盾，
  开工前已确认取**实色不透明**，也就是保持现在的 `section`，不做透明处理。
- 路由是文件式的，详情页需要 `src/routes/articles.$slug.tsx` 这种带参数的文件。

## 还没定的事

开工前问了人两个问题，都已定：topbar 不透明；contacts 简化成纯联系页。其余由
`Grill: self` 自裁决，见 grill.md。

## 路线

### 切片 1 — 统一条目模型

新增 `src/content/items.ts`，一个类型服务三个集合：

```ts
export type ItemKind = 'post' | 'article' | 'work';
export type Item = {
  id: string;                    // 也是详情页的 slug
  kind: ItemKind;
  date: string;                  // ISO，倒序排列的依据
  tags: readonly string[];       // 标签 key，筛选从这里汇总
  title: L10n<string>;
  image: {src: string; alt: L10n<string>};
  summary: L10n<string>;
  body?: L10n<readonly string[]>; // 详情页正文段落；posts 不带
};
```

`posts` / `articles` / `works` 三个数组从这里导出，外加一个 `recentItems(n)` 给首页用。

新增 `src/content/tags.ts`：`tagLabels: Record<string, L10n<string>>`——只是一份**翻译字典**，
不是「有哪些标签」的枚举。某页有哪些筛选项，一律由该页条目的 `tags` 汇总去重得出。

旧的 `essays.ts` / `work.ts` / `posts.ts` / `home.ts` / `media.ts` 里的内容迁移过来，
`media.ts` 收敛成 `contacts.ts`。

### 切片 2 — 占位图

新增 `public/media/*.svg`，每个条目一张。抽象几何图形，自带配色。

**它们是内容资源，不是样式**——和一张真实照片同性质，所以 `charter/ui.md` 红线 2「禁止原始
样式值」不适用于 `public/` 下的图片文件本身。`src/` 里一行原始值都不会出现。取值取自
`@astryxdesign/theme-stone` 导出的 `stonePalettes`，用脚本生成，不手写十六进制。

### 切片 3 — 三个可复用组件

- `src/components/ItemList.tsx`——`List` + `ListItem`，`startContent` 放 `AspectRatio` 包住的
  缩略图，`label` 是标题，`description` 是摘要，`endContent` 是 `Timestamp`。带 `href` 时整行
  可点进详情。
- `src/components/TagFilter.tsx`——一行 `ToggleButton`，选项由传入的条目数组汇总，永远带一个
  「全部」。`charter/ui.md` 说竖向 stack 会拉伸子元素，所以外面套 `HStack wrap`。
- `src/components/ItemDetail.tsx`——详情页骨架：返回链接、标题、时间、标签、大图、正文段落。

### 切片 4 — 路由

| 路由 | 内容 |
|---|---|
| `/` | hero（`Intents × AI = New world` + 自我介绍）+「最近动态」列表，**只有这两块** |
| `/posts` | TagFilter + ItemList，条目不可点 |
| `/articles` | TagFilter + ItemList，条目链到 `/articles/$slug` |
| `/articles/$slug` | ItemDetail |
| `/works` | TagFilter + ItemList，条目链到 `/works/$slug` |
| `/works/$slug` | ItemDetail |
| `/contacts` | 邮箱 + 平台名与链接，无筛选无列表 |

删除 `essays.tsx`、`work.tsx`、`media.tsx` 及其内容文件。

### 切片 5 — 外壳

`SiteShell` 的导航项换成五个新入口。topbar 保持 `variant="section"` 实色。
首页现有的 now 列表、兴趣卡片、metadata 全部删除。

页脚保留一行（一句说明 + 版权）。它是站点 chrome 不是装饰；如果验收时人觉得多余，删掉是一行的事。

## 红线查询（写代码之前）

| 动作 | 命中条目 | 结论 |
|---|---|---|
| 新增 `public/media/*.svg` | `ui.md` 2「`src/` 下禁止原始样式值」——文件不在 `src/` 下，且是图片内容而非样式 | 通过。`src/` 内零原始值 |
| 新增 ItemList / TagFilter / ItemDetail 组件 | `ui.md` 关于组件层级的 Contract | 通过。三者都是 organism 级，Astryx 没有等价物（已用 `astryx component --list` 核对过 List/Item/ToggleButton/AspectRatio 的能力边界） |
| 删除 essays/work/media 路由与内容文件 | 无命中 | 通过 |
| 新增 `src/content/items.ts`、`tags.ts`、`contacts.ts` | `arch.md` 1「`src/content/` 下的文件不得 import React 或组件」 | 遵守：三者都是纯数据 |
| 不新增依赖 | `arch.md` 2 | 不触发 |
| 不改 `vite.config.ts` 浏览器 target | `arch.md` 5 | 不触发 |
| 不动 server.mjs / Dockerfile / 端口 | `devops.md` | 不触发 |

没有命中任何「绝对禁止」或需要人批准的条目。
