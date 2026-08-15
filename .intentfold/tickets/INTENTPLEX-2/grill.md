# Grill — INTENTPLEX-2（自裁决）

工单 `Grill: self`，授权来自人在发起时说的「直接走完 cap3 开发完毕，等我验收」。

## 开工前问了人的两件事

工单原话里有一处自相矛盾——「topbar是透明的，不对，要修一下」——这不是能自裁决的东西，
所以在写任何代码之前当面问了：

1. **topbar 要不要透明？** → **不要透明，保持实色。**
2. **contacts 页放什么？** → **简化成纯联系页**，去掉现在媒体矩阵页的 cadence／读者数／描述。

第 1 条后来被证明指向一个真实缺陷，见下面的前提探测。

## 自裁决的问题

**「最近动态」放什么？** 三类条目按时间合并，取最近 8 条。工单说首页只有 hero 和一个 item
list，没说列表内容；跨类合并是唯一说得通的读法，否则「最近动态」和 posts 页就是同一个东西。

**posts 要不要详情页？** 不要。工单只说「articles和works可以打开详情页面」，posts 被明确排除。
posts 的 summary 就是全文。

**筛选怎么算「自动」？** 拆成两半：**有哪些标签**由该页条目的 `tags` 汇总去重得出，
**标签怎么翻译**留一份字典 `tags.ts`。翻译无法从数据推导，但「哪些标签存在」可以，而后者
才是工单在意的——旧代码里写死的是 `FILTERS = ['all','build','read','teach','play']` 这种枚举。
可判定形式写进了 AC3 第 5 条：posts 与 articles 的标签集合必须不同。

**页脚留不留？** 留一行版权。它是站点 chrome 不是装饰。如果验收时人觉得多余，删掉是一行的事。

**图片用什么？** 仓库里没有任何图片资源。用脚本生成 19 张抽象几何 SVG 占位图放进 `public/media/`，
配色**从 `@astryxdesign/theme-stone` 导出的 `stonePalettes` 读取**，不手写十六进制——这样占位图
不会漂移出主题调色板。每张图的颜色和形状由条目 id 的 FNV 哈希决定，所以重新生成不会变、
相邻条目也不会撞样式（一开始按数组下标轮换，首页把三类交错之后就出现了相邻重复）。

## 前提探测

| 前提 | 探测结果 |
|---|---|
| topbar 现在到底是不是透明的 | **是，而且是个真缺陷。** 逐层读 computed background：`.astryx-app-shell-header` 是 `rgba(0,0,0,0)`，整条链上只有最外层 `.astryx-app-shell` 有白底。滚动到 500px 时截图，正文行直接从导航文字底下穿过去。人说的「不对，要修一下」指的就是这个 |
| 哪个 AppShell variant 会给导航上色 | `section` 只画分割线，不上色；`surface` 才画背景。改成 `surface` 后 header 变成 `rgb(255,255,255)`，滚动截图确认正文被挡住 |
| Astryx 有没有「行内预览图」的现成组件 | 有，`Thumbnail`，固定 64px 见方。一开始用 `AspectRatio` + 自己给宽度，那是 `src/` 里的原始长度值，违反 `ui.md` 红线 2；换成 `Thumbnail` 之后 `src/` 里一个原始值都没有了 |
| `ListItem` 支不支持 `descriptionLines` | **不支持**，那是 `Item` 的 prop。已按 `astryx component` 的实际输出改正，没有硬套 |
| `HStack` 会不会转发 `role` / `aria-label` | **不会**。AC 脚本原来用 `[role="group"]` 定位筛选行，结果匹配到了外观菜单。改成按 `.astryx-toggle-button` 定位——Astryx 的稳定选择器面 |
| AppShell 会不会渲染 `<main>` | **不会**，尽管它的文档这么说。AC 里 `main p` 恒为 0，改成 `p.astryx-text` |
