# INTENTPLEX-9 — 实施计划

从 `draft.md` 展开。一个工单做完，四个阶段是交付顺序。

## Redline 查表（在写代码之前）

| Redline | 是否触发 | 处理 |
|---|---|---|
| `arch.md` 1 — `src/content/` 下的 copy 文件 import React/Astryx | 否 | 新增的是 `src/db/` 与 `src/server/`，不是 copy |
| `arch.md` 2 — **增删改依赖** | **触发** | 见下 |
| `arch.md` 3 — 手改 `routeTree.gen.ts` | 否 | |
| `arch.md` 4 — **引入第二个进程 / 数据库 / 服务端数据源** | **触发** | 人类在会话中明确决定（"首先要有数据库"），工单 Scope 与 Constraints 都载明 |
| `arch.md` 5 — 改 `vite.config.ts` 浏览器目标 | 否 | 不动 |
| `dev.md` 1 — 提交凭证 | 否 | `DATABASE_URL` / OAuth secret 只走环境变量，`.env` 已 git-ignored |
| `dev.md` 2 — 丢弃脏工作区的改动 | 否 | worktree 干净 |
| `dev.md` 4 — 提交 `.env` | 否 | |
| `ui.md` 全部 | 否 | 后台 UI 同样用 Astryx + StyleX，token 只在 `tokens.stylex.ts` 命名 |
| `devops.md` 3 — 部署改变运行时超出应用代码 | **触发（部署时）** | 加 `DATABASE_URL` 属于"服务需要一个它原本没有的环境变量"。**本工单不部署**，部署时需人类点头 |

### redline 2 — 依赖

需要新增：

| 依赖 | 为什么不可回避 |
|---|---|
| `pg` | 没有驱动就没有 Postgres。人类明确决定要数据库，工单载明用 `pg-easyapp-shared` |
| `sharp` | 服务端把上传图按 INTENTPLEX-7 的管线处理（长边 1280、webp、另出 128px 缩略图）。容器里没有 `cwebp`；不做这一步就等于放弃站点的重量纪律 |

redline 2 的判据是"**not without the human's explicit approval, and only when a ticket carries that
decision**"。两个条件都满足：人类反复明确要求数据库与配图功能，工单 Scope 与 Constraints 载明。
两项都在 handoff 里显著记录。

**其余一律不加依赖**：OAuth 用 `fetch`；会话签名用 `node:crypto`；Markdown 编辑器用 `textarea` +
现有的 Astryx `Markdown` 做预览；不引入编辑器组件库。

---

## 阶段 1 — 库 + 迁移 + 运行时读库（站点行为零变化）

**这一阶段不加任何功能。** 唯一目标：地基从文件换成数据库，而站点渲染逐字节不变。

### 表

```sql
create table entry (
  id uuid primary key, kind text not null, slug text not null, date timestamptz not null,
  cover_media_id uuid references media(id), status text not null default 'published',
  created_at timestamptz, updated_at timestamptz, unique(kind, slug));
create table rendition (
  id uuid primary key, entry_id uuid not null references entry(id) on delete cascade,
  lang text not null, title text not null, body_md text not null, source_url text,
  unique(entry_id, lang));
create table media (
  id uuid primary key, sha256 text not null unique, path text not null unique,
  mime text not null, width int, height int, bytes bytea not null, thumb_bytes bytea,
  created_at timestamptz);
create table syndication (
  id uuid primary key, entry_id uuid not null references entry(id) on delete cascade,
  channel text not null, body text not null default '', status text not null default 'draft',
  remote_url text, posted_at timestamptz, updated_at timestamptz, unique(entry_id, channel));
```

`media.path` 保存对外路径（`/media/linkedin/li-<hash>.webp`）——**形状与现在完全一致**，
所以 180 篇正文里的图片引用一个字都不用改。

### 代码

- `src/db/pool.ts` — pg Pool，服务端限定
- `src/db/schema.sql` — 上面的 DDL
- `src/db/repo.ts` — 查询，返回与现在**完全相同**的 `Item[]` 形状
- `src/server/content.ts` — `createServerFn` 包装（loader 在客户端导航时也会跑，DB 访问必须在服务端函数后面）
- `src/server/media.ts` — `createStart({requestMiddleware})` 拦截 `/media/*`，从库里发字节 + `immutable` 缓存头
- `src/content/loader.ts` — 只保留类型与纯函数（`leadOf` / `pickRendition` / `itemHref` / `chronological`）；`import.meta.glob` 移除
- 各 route 加 `loader` + `Route.useLoaderData()`
- `scripts/migrate.mjs` — 一次性：建表 → 读 `content/**/*.md` 与 `public/media/**` → 入库
- `scripts/export-to-repo.mjs` — 反向导出（见下）
- `vite.config.ts` — 内容校验插件改为不再扫 `content/`（那里将不再是真源），校验挪到写路径

### 验收自证

迁移前把 23 条路由 HTML 全抓下来，迁移后再抓一遍，规范化掉每次请求都不同的路由时间戳
（`u:<epoch>`，INTENTPLEX-8 已遇到过）后 `cmp` 逐字节比对。

### 导出回仓库

内容进库后 git 里就没有正文了。`scripts/export-to-repo.mjs` 把库里的内容写回
`content/**/*.md` 与 `public/media/**`，发布后调用。这是写作资产的唯一备份与版本历史。

---

## 阶段 2 — 登录 + 后台 + 编辑器 + 上传

- GitHub OAuth（`fetch`，无依赖），只放行 `ADMIN_GITHUB_ID`
- 会话：`node:crypto` 签名的 HttpOnly cookie
- `/admin` 路由组：列表、新建、编辑
- 编辑器：单栏中文 `textarea` + Astryx `Markdown` 实时预览
- 上传：粘贴/拖入 → `sharp` 处理 → 按 sha256 入 `media` → 返回 `/media/...` 路径插进正文
- 封面图 = `entry.cover_media_id`

## 阶段 3 — AI 生成 + 审核

- 一次调用生成 5 份：站点英文版（写进 `rendition`）+ 四个平台版本（写进 `syndication`）
- 两阶段界面：发布（审英文版）→ 同步（审四个平台版本）
- 生成结果落库、可反复改
- slug 由生成的英文标题派生，发布后冻结

## 阶段 4 — 队列 + 本机 skill

- `syndication.status`：`draft → approved → posting → posted`
- 后台点"发送"= 置 `approved`
- 本机 skill 轮询 `approved`，用 Claude in Chrome 的已登录会话发出去，回写 `remote_url` 与 `posted`
- 幂等：先置 `posting` 再发，拿到 URL 才置 `posted`
- LinkedIn 优先（ips-linkedin 已趟过），再 X 中/英、微博
