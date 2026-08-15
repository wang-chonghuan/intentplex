# Plan — INTENTPLEX-1 让构建产物能作为容器运行

## 代码里读到的、工单没说的事

- `npm run build` 产出两个目录：`dist/client/`（静态资源，带 hash 文件名，入口是 `/assets/*`）和
  `dist/server/server.js`。后者的默认导出是 `createServerEntry({fetch})` 的结果，也就是
  `{ fetch(request) → Response }`，用的是 Web 标准的 Request/Response，不是 node http 的 req/res。
- 这一版 TanStack Start 的 vite 插件没有 nitro/node-server target 选项——`start-plugin-core` 的
  schema 里只有一个 `target: CompileStartFrameworkOptions`（react/solid 的框架选择），没有部署预设。
  所以 `.output/server/index.mjs` 不会被产出，n-easyapp 契约里写的那条启动命令在这个项目上不成立。
- `srvx@0.11.22` 已经在依赖树里（`@tanstack/start-plugin-core` 和 `h3-v2` 都依赖它），并且有
  `./node` 和 `./static` 两个导出，正好是这次要用的两块。提升为直接依赖不会新下载任何东西。
- `package.json` 现在的 `preview` 脚本是 `vite preview`，那是开发期查看构建产物用的，依赖整个
  vite 和 devDependencies，不适合进容器。容器要的是一个只依赖运行时的入口。
- 仓库根目录没有 `.dockerignore`。构建上下文会包含 `node_modules/`（约 500MB）和 `dist/`，
  `az acr build` 要先把整个上下文打包上传，没有 `.dockerignore` 这一步会非常慢甚至卡住。

## 还没定的事（本该是 grill 的内容）

工单填写时人已经拍板了唯一一个真正的分叉——服务入口用 srvx 而不是手写 node:http 适配层，也不是
express。除此之外没有需要人来裁决的问题：端口固定 3000，不动任何页面，镜像基底选择属于实现细节。
`Grill: self` 由人授权，自裁决结论见 grill.md。

## 路线

一个新文件 + 两个新文件 + 一处 package.json 改动，不碰 `src/` 下任何已有代码。

### 切片 1 — Node 服务入口

新增 `src/server-node.ts`（构建时不参与 vite 的 SSR bundle，作为独立入口用 tsx/编译后运行——
见切片 2 的取舍）：

- `import handler from '../dist/server/server.js'` 取到 fetch handler
- `serveStatic` 来自 `srvx/static`，根目录指向 `dist/client`
- 请求先过静态资源，未命中再交给 `handler.fetch(request)`
- `serve({ fetch, port })`，端口读 `process.env.PORT`，默认 3000

实现前需要先读 srvx 的 `./static` 导出的实际签名，不能凭想象写。

### 切片 2 — 让入口能被 node 直接执行

`src/server-node.ts` 是 TypeScript，容器里不该带 tsx 或 ts-node。两个选择：

- (a) 直接写成 `server.mjs`，纯 JS，node 直接跑，零构建步骤；
- (b) 写 `.ts` 再加一个编译步骤。

选 (a)。这个文件只有二十几行、没有类型可言的胶水代码，为它引入一条构建链路违反
`charter/dev.md` 的「无冗余依赖」和「外科手术式修改」。文件放在仓库根目录的 `server.mjs`，
`package.json` 加 `"start": "node server.mjs"`。

`tsconfig.json` 的 `include` 是 `["src", "vite.config.ts"]`，所以根目录的 `server.mjs` 不进
typecheck——这是可以接受的：它不是产品代码，且 `.mjs` 本来也不参与 `tsc --noEmit`。

### 切片 3 — Dockerfile 与 .dockerignore

多阶段构建：

- builder 阶段：`node:24-alpine`，`npm ci`，`npm run build`
- 运行阶段：`node:24-alpine`，只拷 `dist/`、`server.mjs`、`package.json` 和生产依赖
  （`npm ci --omit=dev`），`EXPOSE 3000`，`CMD ["node","server.mjs"]`

`.dockerignore` 至少排除 `node_modules`、`dist`、`.git`、`.intentfold/tmp`、`*.log`。

### 切片 4 — package.json

- `dependencies` 加 `srvx`（版本对齐当前树里的 `^0.11.22`）
- `scripts.start` 改为 `node server.mjs`；`preview` 保留，它是开发期工具

### 切片 5 — 文档同步

`charter/runbook.md` 的「Serve the production build」一节现在写的是 `npm run preview`，
需要改成 `npm run start` 并说明它就是容器里跑的东西。`charter/arch.md` 的 Tools 里
「`dist/server/server.js` 是 fetch handler，不是监听服务」的说明要补上现在由谁来监听。

charter 是人拥有的，机器只报告漂移不自行修改——但这两处是本工单直接造成的事实变化，
且属于 `## Tools`（命令会过时的那一类）。按 SKILL.md「Charter is read-only to the machine」，
**不改**，在 handoff 里报告漂移，由人决定。

## 红线查询（写代码之前）

逐条对照 charter 里四个文件的 `## Redlines`：

| 动作 | 命中的条目 | 结论 |
|---|---|---|
| 新增 `srvx` 为直接依赖 | `arch.md` 2「增删改依赖 — 需人明确批准，且工单载有该决定」 | **已获批准**：人在本次对话中明确选择了 srvx，工单 Constraints 已载明 |
| 新增 `server.mjs` 与 `Dockerfile` | 无命中。不是 `src/content/` 下的文件，不是生成文件，不是第二个进程/数据库/服务端数据源（容器里跑的仍是同一个 SSR 进程） | 通过 |
| 改 `package.json` scripts | 无命中 | 通过 |
| 不改任何 `src/` 下已有代码、不新增样式 | `ui.md` 全部条目均不触发 | 通过 |
| 不改 `vite.config.ts` 的浏览器 target | `arch.md` 5 | 不触发 |
| 首次部署、创建云资源 | `devops.md` 1、2「需人明确批准」 | **已获批准**：人在本次对话中说「可以部署」，工单 Constraints 已载明。执行发生在 cap4 |
| 绑定 intentplex.com | `devops.md` 4「把生产域名指向新东西 — 需人明确批准」 | **已获批准**：人主动要求绑定该域名 |

没有「绝对禁止」类条目被命中。
