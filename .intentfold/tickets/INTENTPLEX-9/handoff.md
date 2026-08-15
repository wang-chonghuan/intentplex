# INTENTPLEX-9 — 个人内容工作台

Type: story。走 draft 路线（approach 在对话里议定，见 `draft.md`），因此不 grill。
一个工单做完四个阶段，不拆。

## What changed

### 阶段一 — 内容与图片迁入 Postgres，站点行为零变化

- `src/db/{schema.sql,pool.ts,repo.ts}`：表结构、连接池、按**原有 `Item` 形状**读取。
  `Item` 一个字段没改，这正是迁移能被逐字节证明而不是靠肉眼看的原因。
- `src/rpc/content.ts`：`createServerFn` 包装。route loader 在客户端导航时也会跑，
  所以 DB 访问必须在服务端函数后面。
- `src/server/media.ts` + `src/start.ts`：`/media/*` 由 request middleware 从库里发字节。
  **路径形状一字未改**（`/media/linkedin/li-<hash>.webp`），所以 180 篇正文里的图片引用
  一个字都不用动。
- `src/content/loader.ts` 收缩成类型与纯函数，`import.meta.glob` 移除。内容不再打包进
  客户端，改走 SSR 载荷。
- 删除 `public/media/`（128 个文件），新增 `export/media/` 作为仓库备份。
- `scripts/migrate.mjs` ↔ `scripts/export-to-repo.mjs`：**互为备份与恢复**。内容进库后
  git 里就没有正文了，导出因此从锦上添花变成必要项。
- 移除构建期内容校验插件——`content/` 不再是真源，校验挪到写路径。

### 阶段二 — GitHub 登录与后台

- `src/server/auth.ts`：单人登录。没有用户表也没有密码——GitHub 说你是谁，
  `ADMIN_GITHUB_USER_ID` 说那是不是唯一放行的账号。用**数字 id 而非用户名**：用户名可以
  改名，然后被别人占用。会话是 `node:crypto` 签名的 HttpOnly cookie，撤销靠轮换
  `SESSION_SECRET`。
- `src/server/oauth-routes.ts`：登录三个 URL 与 `/admin` 闸门都在路由之前处理。重定向和
  `set-cookie` 不是 React 树；闸门放这里也意味着以后新增的后台路由**天然受保护**，
  而不是靠记得加。
- 后台四页：列表、新建、编辑、生成与同步。编辑器单栏中文，`textarea` + 站点同一个
  Astryx `Markdown` 做预览——预览用的就是将来渲染它的那个组件。
- 上传：粘贴或拖入即插入正文；封面单独选。走 INTENTPLEX-7 的管线（长边 1280、
  `webp q82`、另出 128px 缩略图），按**处理后**字节的哈希入库，同一张图上传两次落同一行。

### 阶段三 — 一份中文原文 → 五份生成

- `src/content/channels.ts`：四个平台各自的形状约束（X 的 280、LinkedIn 的
  "see more" 前 200 字、微博的 `#话题#` 与图），服务端拼进提示词、后台用来计数。
  **生成四份不是把同一段话发四遍**。
- `src/server/generate.ts`：英文站点版 + 四个平台版本，全部落库为**草稿**。
  `ui.md` 要求作者读过才能发布，所以这里只写不发。
- 两阶段界面：发布时审英文版（常驻资产，值得单独一屏），同步时审四个平台版本。

### 阶段四 — 队列与本机发送

- `syndication.status`：`draft → approved → posting → posted`。后台的「发送」**不发送**，
  它把行置为 `approved`。
- `scripts/sender-queue.mjs`：`claim` / `posted` / `release` / `list` / `image`。
- `.agents/skills/ipsl-syndicate/`：本机技能，按约定放仓库内、`ipsl-` 前缀。用
  Claude in Chrome 对着已登录会话发，沿用 `ips-linkedin` 趟过的路子。

## 一个决定了整体形状的约束

**发送必须发生在有 Chrome 会话的地方——你的电脑，不是 Azure 容器。** 容器里的按钮驱动不了
本机浏览器。所以网页端负责写作、生成、审核、批准，本机技能负责真正发出去。这不是妥协，
是唯一诚实的架构。

## 验证

| | |
|---|---|
| 公开站点渲染 | **23 / 23 条路由逐字节相同** |
| 媒体 | 134 个路径从库里出，字节与原文件**完全一致**，`immutable` 缓存头保留 |
| 备份往返 | 导出 180 个内容文件 + 147 个媒体文件 → 重新导入 → 计数与渲染均不变 |
| 客户端产物 | **零外部化警告**，不含 `pg` / `sharp`；1.0MB |
| 鉴权 | `/admin`、`/admin/new`、`/admin/edit/*`、`/admin/syndicate/*` 未登录一律 302 到登录；`/admin/denied` 免登录可达 |
| 队列 | 七步全通：四条草稿 → 批准两条跳过两条 → **并发两次认领拿到不同行、无重复** → 队列空返回 null → posted / release → release 后可再认领 |
| 机械防线 | `npm run build` exit 0、`npx tsc --noEmit` exit 0 |

逐字节比对规范化了三样**必然变化**的东西：路由序列化载荷（内容改走 SSR）、
`modulepreload`、产物 hash（新增后台代码）。其余一字未动。

## Deviations

**没有 `ac.md`。** 工单的四条验收标准写在 backend 上，本文件逐条给了证据。

**`arch.md` 未改。** 它的 Contract 现在写着"没有数据库、没有认证、没有服务端数据源"，
这三样这个工单全破了。改 charter 需要你说出「我亲自同意修改charter」——
INTENTPLEX-10 那次授权只覆盖那一张单子。**这是合并前要处理的事。**

**`runbook.md` 未改。** 它没有 `DATABASE_URL`、没有新脚本、没有 `node --env-file=.env
server.mjs`。同样需要那句话。

**新增依赖 `pg`、`sharp`**（`arch.md` redline 2）。工单 Scope 与 Constraints 载明了数据库
与配图决策，两者是那个决策不可回避的实现。其余一律没加：OAuth 用 `fetch`，会话签名用
`node:crypto`，编辑器用 `textarea` + 现有 `Markdown`。

**共享库缺角色与 schema。** n-easyapp 的契约推导出 `intentplex-schema` / `intentplex-user`，
但 cap1 的建库那一步当初没跑——库里根本没有这个角色。按契约的命名补建了，脚本留在
`tickets/*/tmp/`，没进仓库：那是 substrate 的事，不是产品仓库的事。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-9`，端口 web **53009**
  （本地验证用的是 3000，因为 `server.mjs` 读 `PORT`）
- **新增 env key，四个**：`DATABASE_URL`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、
  `ADMIN_GITHUB_USER_ID`、`SESSION_SECRET`、`ANTHROPIC_API_KEY`
- `.env` 已在 `.gitignore` 里，未提交

## Residual — 合并/部署前必须处理

1. **`arch.md` 与 `runbook.md` 要改**，需要你说那句话。
2. **部署会触发 `devops.md` redline 3**：容器需要六个它原本没有的环境变量。那次部署需要
   你点头，且要先在 Container App 上配好这些变量，否则站点起不来——内容现在在库里。
3. **AI 生成没能真跑**：本机没有 `ANTHROPIC_API_KEY`。代码路径写完了，但**"生成五份"这条
   链路我没有端到端验证过**，这是本工单唯一未经实测的部分。
4. **GitHub OAuth 应用要建**：拿到 client id / secret，回调 URL
   `https://intentplex.com/auth/callback`，并把你的数字 user id 填进 `ADMIN_GITHUB_USER_ID`
   （`curl https://api.github.com/users/wang-chonghuan | jq .id`）。
5. **平台发送未实测**：`ipsl-syndicate` 的队列部分全通，但真正的四个 composer 需要在你的
   Chrome 会话里跑一次才算数。技能里写明了"改了就先抓包再写进 references"。

## 其余

- slug 目前手填。draft 里议定的是由生成的英文标题派生，这一步没做——生成链路本身还没验证，
  在它上面再加一层派生不合适。
- 早先未处理的：404 页用的是 TanStack Router 内置组件，`site.ts` 里的双语文案是死的；
  `/favicon.ico`、`/robots.txt` 仍 404；Playwright 不在 `package.json`（`arch.md` redline 2）。
