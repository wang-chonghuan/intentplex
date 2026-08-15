# INTENTPLEX-6 — 把 contacts 页的 mockup 换成真实联系方式

Type: story。Grill: self —— 人类在请求里逐条给出了全部取值，没有需要反问的地方。

## What changed

只改 `src/content/contacts.ts` 一个文件。`src/routes/contacts.tsx` 一行没动：它本来就是 `map` 遍历
`contactLinks` 渲染的，改数据就够——这正是 `dev.md`「Copy is data, not markup」那条 Guidance 想要的效果。

- 邮箱：`hello@intentplex.com` → `intentplex@gmail.com`
- X：`@yongwang` / `https://example.com/x` → `@intentplex` / `https://x.com/intentplex`
- LinkedIn：`in/yongwang` / `https://example.com/linkedin` → `in/chonghuan` /
  `https://www.linkedin.com/in/chonghuan`
- GitHub：不变（`href` 原本就是真的）
- 删除三条：The Intent Letter（substack）、WeChat、小红书——人类说「其他的不用留」，是删掉而不是改 href
- 顺序按人类给出的：邮箱、X、LinkedIn、GitHub

lede 那句「Email is the one I actually read. Everything else is where the writing lands.」剩三条外链之后
仍然成立，没动。

## AC results

1. **contacts 页正好四条，无 Newsletter / 微信 / 小红书** — PASS。浏览器读页面文本：`Email` ·
   `intentplex@gmail.com` · `X` · `@intentplex` · `LinkedIn` · `in/chonghuan` · `GitHub` ·
   `wang-chonghuan`。对 `Intent Letter` / `WeChat` / `小红书` / `substack` 四个词做否定检查，全部不存在。
2. **每个外链指向真实站点，全站再无 example.com** — PASS，但 LinkedIn 那条要说清楚：
   - `https://github.com/wang-chonghuan` → 200，GitHub 对不存在的用户是 404，所以 200 即存在。
   - `https://x.com/intentplex` → 浏览器打开，标题 `iamyong.com (@intentplex) / X`，账号确实存在。
   - `https://www.linkedin.com/in/chonghuan` → curl 回 **999**，那是 LinkedIn 挡非浏览器请求的固定码，
     不是坏链。用浏览器打开则被重定向到注册墙——LinkedIn 对未登录访客一律如此。**因此「这个 profile 确实
     存在」这一点我没能独立证实**，只证实了域名与路径形态正确、且是人类自己给出的地址。不登录 LinkedIn
     是刻意的。
   - `grep -rn "example.com" src/ content/` 无结果。
3. **邮箱是可点击的 mailto** — PASS。可访问性树里 `link href="mailto:intentplex@gmail.com"`。
4. **中英文都正常渲染，四条都在** — PASS。英文如上；点语言开关切到中文后：`联系` ·
   `邮件是我真的会看的那个。其余都是文字最后落到的地方。` · `邮箱` · `intentplex@gmail.com` · `X` ·
   `LinkedIn` · `GitHub`，四条齐全。链接名（X / LinkedIn / GitHub）是专名，两种语言下相同，符合预期。

机械防线：`npm run build` exit 0，`npx tsc --noEmit` exit 0。

验证用的是内置浏览器，不是 Playwright——Playwright 仍不在 `package.json` 里（`arch.md` redline 2，见
Residual）。

## Deviations

story 类型本应有 `plan.md` 与 `ac.md`。本工单的改动是单文件常量替换，取值由人类逐条给定，AC 已写在工单
上；没有另写 `plan.md`。这是一处偏离，记在这里而不是事后补文件。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-6`
- 端口：web **53006**，服务运行中（`PORT=53006 npm start`）
- env key：无新增、无修改、无删除

## Residual

- 图片方案已讨论未落单：145 张里 **81 张（41.5MB / 75% 体积）无人引用**，是 INTENTPLEX-3 清转发时留下的；
  最大的两张（20.6MB、6.6MB）都在孤儿里。删孤儿 + 按渲染宽度缩图 + 转 WebP，55MB 可到 2–3MB。
- 静态资源**没有 `cache-control` / `etag`**，`server.mjs` 的 `serveStatic` 在裸奔；文件名本身是内容哈希，
  天然可 `immutable` 缓存。这比换存储方案收益大。
- `intentplex.com` 当前是 Cloudflare 灰云（响应无任何 `cf-*` 头），没有 CDN 在前面。
- Playwright 不在 `package.json` 里（`arch.md` redline 2）。
- 文章标题仍带 LinkedIn 后缀（如 `(Original + Claude)`）。
