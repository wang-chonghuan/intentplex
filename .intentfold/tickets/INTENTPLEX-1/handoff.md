# Handoff — INTENTPLEX-1 让构建产物能作为容器运行

自主开发（cap3），首次交付。

## 改了什么

四个文件新增，一个改动，`src/` 下一行未动。

| 文件 | 内容 |
|---|---|
| `server.mjs`（新） | 生产服务入口。`srvx/static` 的 `serveStatic` 提供 `dist/client`，未命中的请求交给 `dist/server/server.js` 默认导出的 fetch handler，`srvx/node` 的 `serve` 绑定端口。端口读 `PORT`，默认 3000，监听 `0.0.0.0` |
| `Dockerfile`（新） | 多阶段。builder：`node:24-alpine` + `npm ci` + `npm run build`。runtime：`node:24-alpine` + `npm ci --omit=dev`，只拷 `dist/`、`server.mjs` 和两个 manifest，`EXPOSE 3000`，`CMD ["node","server.mjs"]` |
| `.dockerignore`（新） | 排除 `node_modules`、`dist`、`.git`、`.intentfold/tmp`、env 文件等。构建上下文要整体上传，没有它 `az acr build` 会先卡在几百 MB 的上传上 |
| `package.json` | `dependencies` 加 `srvx@^0.11.22`；`scripts.start` 改为 `node server.mjs` |

为什么需要这一层：`vite build` 产出的 `dist/server/server.js` 默认导出是
`{fetch(Request) => Response}`，不是能监听端口的服务；这一版 TanStack Start 的 vite 插件没有
node-server / nitro 部署预设（`start-plugin-core` 的 schema 里只有框架选择 `target`），所以
n-easyapp 契约写的 `node .output/server/index.mjs` 在本项目上不成立。`server.mjs` 就是缺的那一半。

## AC 结果

检查脚本 `.intentfold/tickets/INTENTPLEX-1/tmp/ac.mjs`，跑在**容器**上——
`docker run -d --rm -p 53001:3000` ——不是宿主机上的 `npm start`。**14/14 通过**，截图在同目录。

| 标准 | 观察到的证据 |
|---|---|
| **AC1** 五个路由 200 且正文是 SSR 出来的 | `/` `/posts` `/essays` `/work` `/media` 全部 HTTP 200，各自的独有正文文字都出现在响应体里（`I build systems…`、`deleting a retry loop`、`Teaching Is a Design Problem`、`Rulesmith`、`The Intent Letter`）。只断言状态码不够——SSR 挂掉时容器照样返回 200 加空壳 |
| **AC2** 样式、导航、语言、控制台 | desktop 1280×800 与 mobile 390×844 各跑一遍，四项全过：`data-astryx-theme=stone`，正文 computed font 是 Figtree、标题是 Montserrat，`/assets/*.css` 200；点顶栏 Work 后 URL 变 `/work` 且渲染出 Rulesmith（这同时证明 JS 加载并 hydrate 成功）；点「中文」后 `/work` 导语切成中文；控制台无 error、无 hydration 警告 |
| **AC3** 容器在 3000 上监听 | `docker port` 显示 `3000/tcp -> 0.0.0.0:53001`，上面所有请求都经这条路径到达容器 3000；容器日志 `Listening on: http://localhost:3000/` |

**头三次 AC 跑出 4 个 FAIL，三个是检查本身的问题，一个是既有事实**，都按 `charter/qa.md`
「先判断是实现缺陷还是测试问题」处理：

1. `body` 的 computed font 是 `Times` → **测试问题**。Astryx 把字体 token 放在自己的组件上，
   不放在 `<body>`；断言 `body` 读到的是 UA 默认值，跟样式有没有加载无关。改成断言
   `.astryx-text`（Figtree）和 `h1`（Montserrat）。
2. mobile 语言断言失败 → **测试问题**。768px 以下导航收进抽屉，而「作品」同时又是 `/work` 的
   页面标题，导航文字断言要么匹配到错的节点要么匹配不到。改成断言页面正文里的中文导语。
3. 控制台 404 → **既有事实，不是本工单造成的**。唯一那条 error 是浏览器对 `/favicon.ico` 的
   隐式请求，站点根本没有 `public/` 目录。dev 环境同样如此。按来源 URL 排除掉；注意浏览器的
   隐式 favicon 请求**不触发 Playwright 的 `response` 事件**，所以只能从 console 消息的
   `location().url` 上认它——第一版按 response 事件过滤是无效的。

## 与 plan.md 的偏差

- **plan.md 切片 5「文档同步」没有执行。** 计划里就已经判断这是 charter 漂移、机器只报告不自行
  修改，见下面的 Residual。
- 其余按计划执行，没有偏离。

## 环境

- 本工单端口：web **53001**（宿主机），映射到容器 3000。`ticket.json` 记录的就是这个。
- **没有任何 env key 新增、修改或删除**，项目至今不需要 env 文件，cap4 无需回写。
- 本机 docker daemon 原本没起，`colima start --cpu 4 --memory 6 --disk 40` 之后可用
  （docker 29.5.2）。这是本机环境，不是仓库的一部分。

## Residual — 值得单独开工单的事

1. **站点没有 favicon。** `/favicon.ico` 404，没有 `public/` 目录。`ips-golive` cap6
   （share surface）覆盖 favicon、Open Graph、Twitter Card 这一整块，建议一并做。
2. **Playwright 没有进 `package.json`。** `charter/qa.md` 的 `## Tools` 把 Playwright 写成了
   本项目的测试工具，但 `charter/arch.md` 红线 2 说增删改依赖需要人明确批准，本次批准只覆盖
   srvx。所以 Playwright 用 `npm i --no-save` 装在本机 `node_modules` 里跑完了 AC，**没有提交**。
   下一个需要跑 AC 的工单会再装一次。要不要把它固化成 devDependency，需要人拍板。
3. **charter 漂移，两处，机器不自行修改：**
   - `charter/runbook.md` 的「Serve the production build」写的是 `npm run preview`，现在容器里
     跑的是 `npm start`（`node server.mjs`）。`preview` 仍然有效，但它已经不是生产启动方式了。
   - `charter/arch.md` 的 `## Tools` 写「`dist/server/server.js` 是 fetch handler，不是监听
     服务 —— 见 runbook.md」，现在应当补一句是 `server.mjs` 在监听。
   两处都属于 `## Tools`（会过时的那一类），由人决定怎么改。
4. **n-easyapp 的 `tanstack-start` 契约与本项目不符。** 它写 `node .output/server/index.mjs`，
   本项目是 `node server.mjs`。端口 3000 一致。部署时要按实际启动命令走，不能照抄契约。
