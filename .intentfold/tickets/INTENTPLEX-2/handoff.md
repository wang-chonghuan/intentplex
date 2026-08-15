# Handoff — INTENTPLEX-2 重做整站信息架构与页面结构

自主开发（cap3），首次交付。`Finish: review`——服务留着，等人验收。

## 改了什么

**信息架构.** 五个入口：home / posts / articles / works / contacts。essays 更名 articles，
media（媒体矩阵）收敛成 contacts。四种各不相同的页面结构收敛成一种。

| 文件 | 变化 |
|---|---|
| `src/content/items.ts`（新） | 一个 `Item` 类型服务三个集合。字段：`id`（也是详情页 slug）、`kind`、`date`、`tags`、`title`、`image`、`summary`、`body?`。另出 `recentItems(n)`、`findItem()`、`itemHref()` |
| `src/content/tags.ts`（新） | 标签的**翻译字典**。有哪些标签由条目汇总得出，不在这里枚举 |
| `src/content/contacts.ts`（新） | 邮箱 + 六个平台的名字与链接。没有 cadence、读者数、描述 |
| `src/content/{essays,work,media,posts}.ts` | 删除，内容迁进 `items.ts` |
| `src/content/{home,site}.ts` | home 只剩 headline / intro / recentHeading；site 换成新的五个导航项，加上筛选与详情页的文案 |
| `src/components/ItemList.tsx`（新） | `List` + `ListItem`，`startContent` 是 `Thumbnail`，`endContent` 是时间 + 标签。空集合渲染 `EmptyState` |
| `src/components/TagFilter.tsx`（新） | 一行 `ToggleButton`。`collectTags()` 从条目汇总，`filterByTag()` 过滤 |
| `src/components/ItemPage.tsx`（新） | 标题 + 筛选 + 列表。posts / articles / works 三页共用它 |
| `src/components/ItemDetail.tsx`（新） | 返回链接、标题、时间、标签、16:9 大图、正文段落 |
| `src/components/PageHeader.tsx` | 删除，被 `ItemPage` 取代 |
| `src/components/SiteShell.tsx` | 新导航项；`variant` 从 `section` 改成 `surface`（见下）；页脚只剩版权一行 |
| `src/routes/` | `index` 重写；新增 `posts`、`articles.index`、`articles.$slug`、`works.index`、`works.$slug`、`contacts`；删除 `essays`、`work`、`media` |
| `public/media/*.svg`（新，19 张） | 占位图。配色读自 `stonePalettes`，脚本生成 |

**首页只剩两块**：hero（`Intents × AI = New world` + 自我介绍）和「最近动态」。原来的 now 列表、
三张兴趣卡片、简历版 metadata 全部删掉。essays 页的精选卡片 + 存档双结构、work 页的 KPI 磁贴、
media 页的主次分区也都删掉了。

## 修掉的那个真缺陷

**topbar 之前确实是透明的。** 人原话「topbar是透明的，不对，要修一下」自相矛盾，开工前问了，
人选「不要透明」。探测后发现这不是主观偏好而是真 bug：`.astryx-app-shell-header` 的 computed
background 是 `rgba(0,0,0,0)`，整条祖先链上只有最外层 shell 有白底，所以正文滚动时直接从导航
文字底下穿过去（滚到 500px 的截图存在 `tmp/probe-scrolled.png`，修复前后各一张）。

原因是 `AppShell variant="section"` **只画分割线，不给导航上色**；`surface` 才画背景。改一个
prop 即可，没有任何覆盖或自定义样式。

## AC 结果

`node .intentfold/tickets/INTENTPLEX-2/tmp/ac.mjs`，跑在 dev server 53002 上，
desktop 1280×800 与 mobile 390×844 两个视口，有头模式。**12/12 通过**，截图在同目录。

| 标准 | 观察到的证据 |
|---|---|
| **AC1** 五个入口 + topbar 实色 | 依次点五个导航项，URL 与 h1 全部对应；`.astryx-app-shell-header` 的 computed background 是 `rgb(255,255,255)`，alpha > 0 |
| **AC2** 首页只有两块 | h1 = `Intents × AI = New world`；正文含 `harness engineering`；**整页只有一个 h2**，文本是 `Recent`；**整页只有一个列表**。后两条是「没有别的板块」的可判定形式 |
| **AC3** 倒序列表 + 自动筛选 + 图文 | 三页的日期序列都非递增；筛选项 ≥ 3；每一行都有 `naturalWidth > 0` 的图和非空文字；点第二个标签后剩下的每一行都带该标签；**posts 与 articles 的标签集合不同**——写死的枚举做不到这一点 |
| **AC4** 详情页 | `/articles` 与 `/works` 点首行都进入 `/articles/<slug>`、`/works/<slug>`，有 Back 链接和 ≥ 2 个正文段落；`/posts` 的行**没有任何锚点** |
| **AC5** 中文 | 顶栏出现 动态/文章/作品/联系；首页 h2 是 `最近动态`，正文含 `Harness engineering`；筛选标签渲染中文；倒序与图文在中文下同样成立 |

**跑出过 5 个 FAIL，一个是产品缺陷，四个是检查本身的问题**，都按 `charter/qa.md` 先判性质再改：

1. `header bg=rgba(0,0,0,0)` → **产品缺陷**，就是上面那个透明 topbar。改 `variant`。
2. 筛选行定位不到按钮 → **测试问题**。`HStack` 不转发 `role`/`aria-label`，`[role="group"]` 匹配
   到了外观菜单。改用 `.astryx-toggle-button`。
3. `main p` 恒为 0 → **测试问题**。AppShell 并不渲染 `<main>`（尽管其文档这么写）。改用
   `p.astryx-text`。
4. mobile 点导航后 h1 读到旧值、Back 链接读到 0 → **测试问题**，路由切换的竞态。加了一个
   轮询直到文本落定的辅助函数，以及对 Back 链接的 `waitFor`。

## 与 plan.md 的偏差

- **切片 3 的缩略图实现换了。** 计划写的是 `AspectRatio` 包一张图并给固定宽度。写完之后自查
  发现那两个宽度（`132px` / `84px`）是 `src/` 里的原始长度值，命中 `charter/ui.md` 红线 2。
  把 token 注册表加两个值需要人批准（红线 1），两条路都堵着——第三条路是用 Astryx 自己的
  `Thumbnail`（固定 64px，专为「行内预览图」而生），于是 `src/` 里一个原始值都不剩。
  已用 grep 复核：除 `tokens.stylex.ts` 外，`src/` 下没有任何十六进制颜色或裸长度/时长字面量。
- **`SiteShell` 的 `variant` 从 `section` 改成 `surface`**，计划里写的是「保持现在的 `section`」。
  那是基于「现在是实色」的错误假设；探测推翻了它。
- 其余按计划执行。

## 环境

- 端口 **53002**（`ticket.json` 记录的就是这个），dev server **仍在运行**，等人验收。
- **没有任何 env key 变更**，cap4 无需回写。
- Playwright 依旧用 `npm i --no-save` 装在本机，**没有提交**——原因见下面 Residual 第 2 条，
  与 INTENTPLEX-1 一致。

## Residual — 值得单独开工单的事

1. **占位图是占位图。** 19 张抽象几何图形，等真实图片替换。生成脚本在
   `tmp/gen-media.mjs`，改完条目重跑一次即可。
2. **Playwright 仍未进 `package.json`。** `charter/qa.md` 把它写成本项目的测试工具，
   `charter/arch.md` 红线 2 又要求依赖变更需人批准，本次批准只覆盖了 srvx 之外的「不新增依赖」。
   需要人拍板。
3. **`charter/ui.md` 有两处已经和代码不符**，机器不自行修改：
   - 「Component structure」一节写 `src/components/` 只放 organism 和外壳层，现在多了三个
     列表/详情组件，仍属该层，但值得人确认这个描述还准不准。
   - 「Layout and responsive」一节没提 topbar 的 variant 选择，而这次证明 `section` 与
     `surface` 的差别是会出真 bug 的，值得写进 Contract。
4. **`charter/runbook.md` 与 `arch.md` 的 Tools 漂移**（生产启动方式是 `npm start` 不是
   `npm run preview`）——INTENTPLEX-1 的 handoff 已记录，仍未处理。
5. **站点仍然没有 favicon、OG、robots.txt、统计**。ips-golive cap3/5/6 覆盖。
