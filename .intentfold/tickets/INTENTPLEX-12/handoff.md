# INTENTPLEX-12 — 顶栏 Admin 入口，后台文案双语

Type: story。Finish: auto-deploy。

## What changed

- `src/content/admin-copy.ts`：后台全部文案的 `L10n` 表。跟站点其余部分同一套机制
  （`t()` + `L10n`），没有第二套 i18n。
- `src/components/SiteShell.tsx`：Contacts 之后加 Admin。**一直显示**——只在登录后显示会让
  同一个 URL 的 HTML 随 cookie 变化，将来若把 apex 翻成 Cloudflare 橙云，就得为一个按钮
  给整站缓存策略开例外。而且这扇门本来就不是秘密，它只对一个 GitHub 账号开。
- `src/components/AppLink.tsx`：`/admin` 与 `/auth/*` 走 `reloadDocument`。
- 四个后台页与 `EntryEditor` 的 50 处写死中文全部换成 `t()`；`channels.ts` 的平台标签也双语化。
- `/admin/denied` 重写：加了回站链接。原先用错账号进去之后没有出路。

## 为什么 Admin 这个链接必须整页加载

顶栏链接都经 `AppLink`，内部路径一律变成 `RouterLink` 走客户端路由。而挡住 `/admin` 的是
**request middleware**，只在文档请求时跑。客户端导航根本不发文档请求，于是会绕过登录重定向，
落到一个 loader 会抛「not signed in」的路由上——**错误边界，不是 GitHub 登录页**。

规则写在 `AppLink` 里而不是某个调用点：它是唯一的链接适配器，第二个知道这件事的地方正是
`arch.md` 禁止的。

## AC results

1. **顶栏有 Admin 且点它跳登录** — PASS。浏览器实测导航为
   `Home / Posts / Articles / Works / Contacts / Admin`；未登录点击后**整页跳到 github.com**
   （没有 `reloadDocument` 时这里就是报错页）。
2. **后台中英切换、默认英文** — PASS。默认 `lang="en"`，`/admin/new` 标题 `Write`，按钮
   `Post / Article / Work / Choose a cover / Write / Preview / Publish / Save draft`，
   正文里**零残留中文**；点「中文」后 `lang="zh-Hans"`，标题「写新的」，按钮全中文。
   Admin 两种语言下都是 `Admin`。
3. **denied 页有回站链接** — PASS。`Not you` / `Back to the site`，`a[href="/"]` 存在。
4. **公开站点不受影响** — PASS。全部路由 200。

机械防线：`npm run build` exit 0，`npx tsc --noEmit` exit 0。

## Deviations

无。`admin.syndicate.$id.tsx` 里还剩一处中文，是注释，不是界面文案。
