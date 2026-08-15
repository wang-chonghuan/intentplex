# INTENTPLEX-5 — 修好 devops.md 里推导不出路由的部署后检查

Type: chore（无 plan.md / ac.md / grill）。Finish: auto-merge。人类在会话中说出「我亲自同意修改
charter」，并明确要求这一处由我自己判断怎么改。

## What changed

只改文档，产品代码 0 行改动（`git diff --name-only origin/main -- ':!.intentfold'` 为空）。

**`charter/devops.md` — 部署后检查**

命令重写。三处，各自堵一种不同的失败：

1. `grep -oE` → `grep -aoE`。本站首页是一整行 UTF-8（中文、em dash），BSD grep 在非 UTF-8 locale 下把
   它判定为 binary，然后**一条匹配都不报**，也不说自己跳过了。没有 `-a`，这条检查在最可能运行它的那台
   机器上推导不出任何东西。
2. **空推导变成硬失败**。原来的写法是 `… | while read -r p; do …; done`：推导出空集就循环零次、退出 0。
   这才是真正的问题——推导取代枚举之后，旧的「清单过时」失败没了，换来一个更安静的：一个完全挂掉的站点
   会打印零行然后通过。现在先把路由收进变量，空则报错退出 1。
3. **逐条路由的判定也进了退出码**。每条必须是 200 且正文大于 10 kB；否则最后整体退出 1。10 kB 是「真页
   面」和「空壳」的分界——容器起来了但 SSR handler 挂了，仍然会回 200，只是正文小一个数量级。

散文部分改成三条对应的说明，讲清楚每一条为什么在那儿。**没有写死任何路由**，推导仍然是唯一来源。

**`charter/format.md` — 测试 4**

- 新增规则：**推导型命令必须自证推导成功**。推导不是消除了安静失败，只是把它挪了个位置——推导零个目标、
  循环零次、退出 0，和「全部通过」在输出上无法区分。顺带写明这类错误有多容易撞上（就是上面的 grep 判定
  binary），空推导守卫是那条不需要预判就能兜住它的线。
- 测试 4 里那段示范代码本身就带着同一个 bug（`grep -oE`、无守卫）——它在教这个错误写法。改掉了。
- `format.md` 是 machine-owned，改动同步回 intentfold 技能模板（
  `references/templates/charter/format.md`），仓库副本与模板逐字节一致。

**intentfold 技能模板 — `references/templates/charter/devops.md`**（本仓库之外）

模板里的部署后检查是同一条坏命令，会把哑弹播种给每个新初始化的项目。这才是真正的传播源，一并改成带守卫
的版本，并把三个要点写进模板的填空说明里。空壳字节阈值留成占位符，由每个项目自己填。

## AC results

验证用的命令是**从 `devops.md` 里 awk 抽出来原样跑的**，不是我手边那份草稿。

1. **对线上站点能列出多于零条路由，每条打印状态码和字节数** — PASS。抽出的命令跑 https://intentplex.com，
   得到 7 条路由（`/` `/articles` `/articles/can-agents-safely-rewrite-themselves` `/contacts`
   `/posts` `/works` `/works/intentplex`），全部 200，字节数 21 k–619 k，结尾
   `OK: 7 routes derived, all 200 with SSR content`，exit 0。
2. **指向空 HTML 或无内部链接的地址时非零退出并打印原因** — PASS，三条路径都试了：
   - 无人应答（`localhost:59999`）→ `FAIL: derived 0 routes … no answer, or a page with no internal
     links`，exit 1。
   - 200 但页面只有外链 → 同一条 FAIL，exit 1。
   - 链接推导得出、但目标 404 或是空壳 → 逐行打印 `404 … 335 bytes` / `301 … 0 bytes`，随后
     `FAIL: a route is missing, erroring, or served without SSR content`，exit 1。
3. **devops.md 里没有写死的路由清单** — PASS。`grep -nE '"/[a-z]+"|/posts|/articles|/works|/contacts'`
   在 devops.md 里无结果。
4. **format.md 记下规则且与技能模板一致** — PASS。format.md:88「A derived command must prove it derived
   something」；`diff` 仓库副本与模板无差异。

机械防线：`npm run build` exit 0，`npx tsc --noEmit` exit 0。

## Deviations

chore 没有 plan.md。一处超出工单字面 Scope：intentfold 技能模板里的 `devops.md` 也带着同一条坏命令，
一并修了。工单只说了同步 `format.md`，但只修 format.md 而放着模板继续播种哑弹，等于修了说明书没修机器。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-5`
- 端口：web **53005** 已分配但未使用——本工单的判据是对线上站点跑命令，不需要起本地服务。
- env key：无新增、无修改、无删除。

## Residual

`format.md` 的规则现在只是散文，靠作者遵守。真正机械化的做法是让每条 `Tools` 里的检查都能被抽出来对着一
个故意坏掉的目标跑一遍（本次验证就是手工做了这件事）。值得单开工单，但需要先有一个「把 charter 里的命令
抽出来执行」的约定，超出本工单范围。

早先提过、仍未处理的：`public/media/linkedin/` 约 57MB 存的是原图；文章标题带 LinkedIn 后缀；Playwright
不在 `package.json` 里（`arch.md` redline 2）。
