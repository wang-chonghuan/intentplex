# INTENTPLEX-4 — 修正 charter 与代码实际情况不符的三处漂移

Type: chore（无 plan.md / ac.md / grill）。人类在会话中说出「我亲自同意修改charter」，本工单据此获准
修改 `.intentfold/charter/`。

## What changed

只改文档，不动任何产品代码、配置或依赖。

**漂移 1 — 生产启动命令**

- `charter/runbook.md` `## Tools`「Serve the production build」：`npm run preview` → `npm start`
  （`node server.mjs`）。补上 `PORT=<port> npm start`，并说明 `npm run preview` 仍在，但那是 Vite 的
  预览服务器，不是本项目的生产启动方式。
- `charter/arch.md` `## Tools`「Build output」：补上 `server.mjs` 是围绕 fetch handler 绑定端口的那一
  半，命令仍然只在 `runbook.md` 出现一次（format.md 测试 3）。

**漂移 2 — 内容存放位置**

- `charter/arch.md` `## Contract`：「Content is static TypeScript in `src/content/`」→ 条目是仓库根部
  `content/` 下的 Markdown + frontmatter，站点外壳文案仍是 `src/content/` 的 TypeScript，两者都在构建
  期读取。
- `charter/arch.md` 结构图：加入 `content/`（含文件名规则）、`public/media/`、`server.mjs`；
  `src/content/` 的注释改为「外壳文案 + 加载器 + 校验器」。
- `charter/arch.md` Key decisions：新增两条既有事实——条目按语言分文件、缺某语言是正常状态；内容在构建期
  校验（`buildStart` 插件），而不是首个请求时。后者是原 Contract 那句隐含的保证（「静态 TypeScript」＝
  tsc 管着），换了位置就得说清楚接替它的是什么。
- `charter/arch.md` Redline 1：措辞从「a file under `src/content/`」收敛为「a copy file」，并点明
  `loader.ts` / `validate.ts` 同目录、是代码不是文案，同一条 import 清单照样约束它们。**判据未变**，
  仍然是一次可查表的 lookup。
- `charter/dev.md` `## Guidance`「Copy is data, not markup」、`charter/qa.md` `## Tools`「Test accounts
  and data」、`charter/ui.md` 的目录归属句：同一处漂移在这三个文件里的其余副本一并改掉。留一处不改会让
  charter 自相矛盾。

**漂移 3 — 双语措辞**

- `charter/ui.md` `## Guidance`「Content and tone」：双语的类型级保证限定在**站点外壳**；条目不受此约束，
  一个条目存在于它被写出来的那些语言里，读者语言不在其中时站点显示原文并说明。理由写进去了：否则只剩
  「翻译完才让发」或「机器翻译」两条路。

**顺带同步（非漂移）**

- `charter/format.md` 从技能模板刷新。模板自己声明它是 machine-owned、由 cap1 从模板刷新，本仓库的副本
  落后一版，缺的正是「必须人类说出『我亲自同意修改charter』才能改 charter」这条门槛。

## AC results

1. **按 runbook 的命令启动能拿到 200，且该段落不再把 `npm run preview` 当生产启动方式** — PASS。
   `npm run build` 后 `PORT=53004 npm start`，日志 `intentplex listening on http://0.0.0.0:53004/`。
   从首页推导出的全部路由：`/` `/articles` `/articles/can-agents-safely-rewrite-themselves`
   `/contacts` `/posts` `/works` `/works/intentplex`，**7/7 返回 200**。SSR 正文确实渲染（首页含
   `Silicon life`），不是空壳。
2. **arch.md 内容位置与仓库一致** — PASS。结构图第 2/5/14 行分别是 `content/`、`public/media/`、
   `server.mjs`；`grep -rn "static TypeScript" charter/` 无结果。
3. **ui.md 双语措辞与实际行为一致** — PASS。「Every user-visible string is bilingual」已不存在；
   ui.md:282 起明确写着条目不受此约束以及站点如何呈现。
4. **build / typecheck 通过，改动只在 `.intentfold/`** — PASS。`npm run build` exit 0（内容校验插件报
   `180 markdown files validated`），`npx tsc --noEmit` exit 0。`git status --short` 只有
   `.intentfold/charter/` 下 6 个文件加本工单目录；`devops.md` 0 处改动。

   注：全新 worktree 里必须先 `npm run build` 再 `tsc`——`routeTree.gen.ts` 是 git-ignored 的生成文件，
   这一点 runbook 的 Troubleshooting 已经写着。

## Deviations

chore 没有 plan.md，无从偏离。两处超出工单字面 Scope 的改动，都记在上面「What changed」里：同一处漂移在
`dev.md` / `qa.md` 的其余副本，以及 `format.md` 的模板同步。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-4`
- 端口：web **53004**（`ports.py ticket INTENTPLEX-4`）
- env key：无新增、无修改、无删除。本项目不需要 env 文件。

## Residual

**`charter/devops.md` 的部署后检查目前是个哑弹，本工单按约束没碰它。** PR #5 把它改成从首页推导路由，
方向是对的，但那条命令用的是 `grep -oE`：本站首页是一整行、含中文和 em dash，macOS 的 BSD grep 在默认
locale 下判定为 binary 并静默吞掉全部匹配。推导结果是空集，`while read` 循环体一次都不执行，于是**一个
完全挂掉的部署也会「检查通过」**——正是 format.md 测试 4 描述的那种失败方向。本次验证里我加了 `-a` 才拿
到 7 条路由。一个字符的修复（`grep -aoE`），但改 `devops.md` 需要人类另行决定。

其余早先提过、仍未处理的：`public/media/linkedin/` 约 57MB（存的是原图，CDN 有约 1/10 大小的中等宽度版
本）；文章标题带着 LinkedIn 的后缀（如 `(Original + Claude)`）；Playwright 仍不在 `package.json` 里
（`arch.md` redline 2）。
