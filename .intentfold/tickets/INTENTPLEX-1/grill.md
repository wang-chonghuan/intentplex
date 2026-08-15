# Grill — INTENTPLEX-1（自裁决）

工单 `Grill: self`，人已授权代理自行裁决。以下是本该问人的问题，以及从 charter、从代码、
从实际探测得出的答案。

## 唯一一个真正的分叉，人已经答了

**服务入口用什么？** 人在本次对话中明确选择 srvx（而非手写 node:http 适配层，也非 express）。
理由记在工单 Constraints 里。这是 `charter/arch.md` 红线 2 要求的那次批准，发生在写代码之前。

## 自裁决的问题

**入口文件写 .ts 还是 .mjs？** 写 `.mjs`。二十几行胶水代码，没有值得写的类型，为它加一条编译
链路会往运行时镜像里塞进一整套 toolchain，违反 `charter/dev.md` 的「无冗余依赖」与「外科手术式
修改」。`tsconfig.json` 的 `include` 是 `["src", "vite.config.ts"]`，根目录的 `.mjs` 本来也不
进 typecheck。

**镜像基底？** `node:24-alpine`，与本机 Node 24 一致。多阶段构建：builder 装全量依赖跑构建，
runtime 只 `npm ci --omit=dev`。SSR bundle 把 react、router、srvx 都留成 external import，
所以运行时仍需要生产依赖树，只是不需要 dev 那一半。

**要不要改 `preview` 脚本？** 不改。`vite preview` 是开发期查看构建产物的工具，`npm start`
是容器里跑的东西，两者用途不同，都保留。

## 前提探测（这是跳过人工 grill 时最容易漏掉的一步）

| 前提 | 探测结果 |
|---|---|
| 这一版 TanStack Start 有没有 node-server / nitro 部署预设 | **没有**。`start-plugin-core` 的 schema 里只有框架选择 `target`，没有部署预设；`dist/server/server.js` 就是最终形态 |
| srvx 是否已在依赖树里、有没有静态文件中间件 | **在**，0.11.22，经 `@tanstack/start-plugin-core` 和 `h3-v2` 传递引入；有 `./node`（`serve`）和 `./static`（`serveStatic({dir})`）两个导出 |
| 本机能不能真的跑容器 | **一开始不能**——docker daemon 没起。colima 已安装但未运行，`colima start` 之后 docker 29.5.2 可用。若当时起不来，AC 就只能等部署后在 Azure 上验，那是一个 stop 而不是降级 |
| 静态资源能不能被正确提供 | 探测过：`/assets/app-*.css` 200 text/css 148KB，`/assets/index-*.js` 200 text/javascript 384KB |

## 顺带发现、但不属于本工单

`/favicon.ico` 返回 404——仓库里根本没有 `public/` 目录，站点不带任何 favicon。这在 dev 环境
同样成立，早于本工单，属于分享面（share surface）的事，`ips-golive` cap6 覆盖它。AC 的控制台
断言按来源 URL 把这一条排除掉，并在 handoff 的 Residual 里记下来。
