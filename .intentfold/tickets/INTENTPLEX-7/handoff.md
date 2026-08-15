# INTENTPLEX-7 — 删掉无人引用的图，其余缩图转 WebP，并给静态资源补上缓存头

Type: fix。approach 在对话里议定，记在 `draft.md`，因此不 grill。

## What changed

### 图片语料：56MB → 4.5MB

- **删掉 81 张无人引用的图**（41.5MB）。INTENTPLEX-3 清掉 73 篇转发时图没跟着删；最大的两张
  （20.6MB、6.6MB）都在里面。
- **留下的 64 张缩到长边 1280px 并转 WebP**（`cwebp -q 82 -m 6 -metadata none`，只缩不放）。原图多为
  2048px，而站点最宽容器是 `pageWidth: 1080px`。
- **另出一档 128px 缩略图**（`li-<hash>.thumb.webp`，`-q 78`，共 145KB，均 2.3KB/张）。列表里
  `Thumbnail` 显示的是 64px 方块，原先却在下载 1280px 的原图。
- 内容里 74 个文件的 136 处引用同步改成 `.webp`。转换是一次性离线操作，**`package.json` 没动**
  （`arch.md` redline 2）。

### /posts 的真正大头：4326KB → 142KB

缩图本身没能救 `/posts`。折叠着的正文也在 SSR HTML 里，浏览器**照样下载**被 CSS 藏起来的
`<img>`——实测 62 张全尺寸图 4184KB 全部下载了，加上新的缩略图反而更重。

修法：`PostList` 在行**关闭**时渲染去掉图片语法的正文，展开时渲染完整正文
（`bodyWithoutImages`）。正文文字仍然进 SSR、仍然可索引（HTML 里 398 个 markdown 段落，随手抽查
`company's real moat` 确实在），只有图片的字节推迟到点击那一下。

### 静态资源缓存

`server.mjs` 加一个 middleware。srvx 的 `serveStatic` 不发 `cache-control` / `etag` /
`last-modified`，也没有配置项，middleware 是唯一的缝。对文件名自带内容哈希的路径
（`/assets/*` 和 `/media/linkedin/li-<hash>.*`）发
`cache-control: public, max-age=31536000, immutable`；HTML 页面不受影响。

## AC results

1. **posts / articles 上原本有图的条目正常显示，无裂图** — PASS。浏览器实测：`/posts` 62 张缩略图
   `broken: 0`；展开一行后精确加载 1 张全尺寸图（1280x720），截图确认图片完整显示在正文下方；
   中文 `/articles` 12 张图 `broken: 0`。`/`、`/articles`、`/works` 及 article/work 详情页逐个核对，
   页面引用的每个 `/media/*` 资源都在磁盘上。
2. **目录 <5MB，文件与引用一一对应** — PASS。`public/media/linkedin` **4.5MB**。全尺寸 64 张、
   缩略图 64 张；`comm` 比对：引用了但缺失 **0**，有文件但没人引用 **0**。
3. **响应带长期不可变缓存头** — PASS。全尺寸图、缩略图、`/assets/*.css` 三者都返回
   `cache-control: public, max-age=31536000, immutable`；`content-type: image/webp` 正确。HTML 页面
   不带该头（正确——页面内容会变）。`immutable` 的语义是浏览器**根本不再发这个请求**，所以这一条不能
   用 curl 复现，curl 每次都会真发；结论依据是响应头本身。
4. **构建、内容校验通过，无失效引用** — PASS。`npm run build` exit 0
   （`180 markdown files validated`），`npx tsc --noEmit` exit 0。全站扫描无指向已删除/已改名图片的引用。

**副产物**：`/posts` 的 SSR HTML 从 619KB 降到 610KB，媒体下载从 4326KB 降到 **142KB**（30×）。

## Deviations

**超出工单字面 Scope 两处，都在上面写明了：**

1. **多出一档 128px 缩略图**，并动了 `loader.ts`（新增 `thumb` 字段与 `thumbOf()`）和
   `ItemList` / `PostList` 两个组件。工单 Scope 写的是「按实际渲染宽度缩图」，而 64px 正是一个渲染
   宽度——只做到 1280px 就停，等于把最贵的那一页留在原地。
2. **`PostList` 关闭时不渲染正文里的图片**。这不在工单里，但不做的话第 1 点在 `/posts` 上是净负收益
   （多 142KB，一分钱没省）。这是本工单唯一改动交互行为的地方：折叠时看不到图，展开时看得到——
   而折叠时本来也看不到。

没做的一件相关的事：给正文图片按渲染宽度再出一档（正文栏 68ch ≈ 700px，现在给的是 1280px）。
展开是逐条按需的，收益远小于复杂度，留在 Residual。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-7`
- 端口：web **53007**，服务运行中
- env key：无新增、无修改、无删除
- 本机装了 `cwebp`（`brew install webp`，1.6.0）。这是**开发机上的一次性工具**，不是仓库依赖；
  转换已经完成并提交了产物，以后除非再导入新图，不需要它。

## Residual

- **git 历史里那 56MB 还在。** 转换不会让已有 clone 变小，要消除需 `git filter-repo` 重写历史。
  仓库还年轻，现在做成本最低——独立决定，未做。
- **正文图片仍是 1280px**，正文栏只有约 700px。可以再出一档，但收益小。
- **未部署。** 本工单只到合并。部署后请按 `devops.md` 的检查确认。
- 若将来仍想要 CDN：正解是把 apex 在 Cloudflare 翻成橙云（现在是灰云，响应无任何 `cf-*` 头），
  零新存储、零代码改动。不在本工单。
- 文章标题仍带 LinkedIn 后缀；Playwright 不在 `package.json` 里（`arch.md` redline 2）。
