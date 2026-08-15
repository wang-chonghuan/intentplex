# INTENTPLEX-11 — 登录跳转发的是 http

Type: fix。Finish: auto-deploy。

## 现象与原因

线上点登录，GitHub 报 `redirect_uri is not associated with this application`。实测发出去的是
`http://intentplex.com/auth/callback` —— **http，不是 https**。

Azure Container Apps 的 ingress 在边缘终结 TLS，转发给容器的是明文 HTTP，所以
`new URL(request.url)` 得到 `http://` 和内部 host。真实值在 `x-forwarded-proto` /
`x-forwarded-host` 里。

**同一个根因还有第二个后果**：`isSecure(url)` 因此在生产上恒为 false，会话 cookie 少了
`Secure` 标志。那是安全问题，不只是登录不通——发现第一个的时候才顺带看见第二个。

## 改动

`src/server/oauth-routes.ts` 加 `publicUrl(request)`：从转发头推导浏览器实际用的 URL，
没有这些头时退回请求自身的 URL（本地 http 开发需要）。origin 与 `isSecure` 都用它。

一个坑：`url.host = 'intentplex.com'` 在原 URL 带端口时**不会清掉端口**，第一版改完变成
`https://intentplex.com:3000`。转发头里不含端口时显式 `url.port = ''`。

## AC results

1. **线上 redirect_uri 是 https** — 部署后实测（见下）。
2. **cookie 带 Secure 与 HttpOnly** — PASS。模拟 `x-forwarded-proto: https` 时
   `HttpOnly; SameSite=Lax; Secure`；本地 http 时无 `Secure`。
3. **本地 http 不被破坏** — PASS。无转发头时 `redirect_uri = http://localhost:3000/auth/callback`。
4. **公开站点 23 条路由全 200** — 部署后实测。

## Residual

真正的 GitHub 登录仍需人类点一次才算完全验证——回调只对 `https://intentplex.com`，
本地无法走通。
