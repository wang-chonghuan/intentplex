# AC — INTENTPLEX-1

工单的验收标准是权威来源，本文件只是可执行的检查计划。三条标准都在**容器里**验证，
不在宿主机上跑 `npm start` 就算数——工单说的是「以容器方式启动」。

容器用本工单的端口块跑：宿主机 **53001** 映射到容器的 3000。

```bash
docker build -t intentplex-ac .
docker run --rm -d -p 53001:3000 --name intentplex-ac intentplex-ac
```

基址 `http://localhost:53001`。

## AC1 — 五个页面路由返回 200，且正文是服务端渲染出来的

**怎么查.** 对五条路由各发一次请求，同时看状态码和正文里是否有该页面独有的中文/英文正文文字。
只看状态码不够：SSR 失败时容器仍然会返回 200 加一个空壳。

```bash
node .intentfold/tickets/INTENTPLEX-1/tmp/ac.mjs
```

脚本内对每条路由断言：

| 路由 | 必须出现在响应正文里的文字 |
|---|---|
| `/` | `I build systems that turn intent into working software` |
| `/posts` | `deleting a retry loop` |
| `/essays` | `Teaching Is a Design Problem` |
| `/work` | `Rulesmith` |
| `/media` | `The Intent Letter` |

**什么算通过.** 五条都是 HTTP 200，且各自的文字在响应正文里出现至少一次。

## AC2 — 浏览器里样式完整、导航可切换、语言可切换、控制台无报错

**怎么查.** playwright 有头模式打开 `http://localhost:53001/`，在 desktop 1280×800 和
mobile 390×844 两个视口各跑一遍（`charter/qa.md` 要求两个视口），全程收集 console 消息。

1. 样式确实加载：断言 `<html>` 上有 `data-astryx-theme="stone"`，并读取正文的
   `computed font-family` 含 `Figtree`——字体来自 stone 主题的 token，样式没加载时会退化成系统字体。
   同时断言页面至少加载了一个 `/assets/*.css` 且状态码 200（静态资源这一条路走通了）。
2. 导航可切换：点顶栏 `Work`，断言地址变成 `/work` 且页面出现 `Rulesmith`；这同时证明
   客户端 JS 加载并 hydrate 成功。
3. 语言可切换：点 `中文` 段，断言顶栏出现 `作品`、`媒体矩阵`。
4. 控制台：整个过程中不出现 `error` 级别消息，也不出现包含 `hydrat` 的警告
   （`charter/qa.md`：带 hydration 警告的 UI 标准不算通过）。

每一步截图存到 `.intentfold/tickets/INTENTPLEX-1/tmp/`。

**什么算通过.** 四项全部成立，两个视口都成立。

## AC3 — 容器在 3000 端口上监听并响应

**怎么查.** 上面两条已经是通过 `-p 53001:3000` 走到容器 3000 端口的，所以路径本身就是证据。
再补一条直接的读取，确认容器内部确实是 3000 而不是别的端口被 docker 转发：

```bash
docker exec intentplex-ac node -e "fetch('http://127.0.0.1:3000/').then(r=>console.log(r.status))"
docker port intentplex-ac
```

**什么算通过.** 容器内部对 `127.0.0.1:3000` 的请求返回 200，且 `docker port` 显示
`3000/tcp -> 0.0.0.0:53001`。
