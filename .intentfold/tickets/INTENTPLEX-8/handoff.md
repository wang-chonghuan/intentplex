# INTENTPLEX-8 — 用 filter-repo 把 56MB 图片从 git 历史里彻底清掉

Type: chore（无 plan.md / ac.md / grill）。这是**不可逆**操作，且是本项目唯一一次允许强推 `main`——
重写历史除此之外无法落地。

## What changed

**`.git` 从 89MB 降到 4.7MB。** 提交内容一字未改，变的只是历史里不再存在那些 jpg blob，以及全部
commit 的 SHA。

### 动手前的准备（这一段本身就是工作量）

历史重写要求仓库处于"没有任何东西挂在旧历史上"的状态，否则重写完这些引用会把旧对象继续吊着。

1. **合并了两个还开着的 PR**：#8（INTENTPLEX-6 contacts）、#9（INTENTPLEX-7 图片）。两者都是
   `finish: review`、本该等人验收，但**开着的 PR 撑不过历史重写**。两者的验收标准此前都已全部 PASS，
   已在各自工单留言说明为何提前合并。工单 6、7 已关闭。
2. **删掉 7 个早已合并、却没清理的远端分支**：`feat/personal-site`、`INTENTPLEX-1/2/3/6/7-*`、
   `chore/charter-derive-not-enumerate`。它们各自吊着一份完整旧历史。判断依据不是
   `git merge-base --is-ancestor`——本项目用 **squash 合并**，原分支 tip 永远不会成为 main 的祖先，
   全部会显示"未合并"。改用 PR 状态判断，9 个 PR 全部 `MERGED`。
3. **停掉服务、清掉全部 worktree**，确认 0 个 open PR。

### 备份（先做，做不成就不往下走）

```
/Users/yong/work/intentplex-ws/intentplex-backup-before-filter-repo/intentplex-full-d3b754e.bundle
```

59MB，含重写前的全部分支。**已验证可还原**：clone 出来 HEAD 是 `d3b754e`，历史里 141 个 jpg blob 都在。

### 重写

在一份全新的 `--mirror` clone 上执行，不在工作仓库里操作：

```bash
git filter-repo --force --path-glob 'public/media/linkedin/*.jpg' --invert-paths
git push --force origin 'refs/heads/*:refs/heads/*'
```

只剔除 `.jpg`。`.webp` 一张没动——那是站点当前在用的图。

推送前先证明了**内容零改动**：重写前后 HEAD 的 tree SHA 都是
`b3539c24381c01c3d6c77393eaa2111b3315bcdf`，完全一致；11 个提交一个不少，提交信息与顺序逐行 diff 无
差异。`main`：`d3b754e` → `199e12a`（forced update）。

### 收尾

本机那份 clone 停在旧历史上。`fetch` + `reset --hard` + `gc` 之后**仍然是 59MB、141 个 jpg blob**——
原因是三个本地分支（`INTENTPLEX-6-real-contacts`、`INTENTPLEX-7-shrink-images`、`feat/personal-site`）
还指着旧提交。删掉它们再 `gc --prune=now` 才真正降到 4.7MB。这一步值得记下来：**远端干净不等于本地干净**，
本地任何一个残留分支都能让整份旧历史留在盘上。

## AC results

1. **重新 clone，`.git` 显著变小** — PASS。全新 clone 的 `.git` **4.8MB**（重写前 89MB，降幅
   94%），整个工作区 11MB。降幅与历史里 59.3MB 的 jpg 相符。
2. **历史里找不到任何 jpg blob** — PASS。新 clone 全量遍历 `rev-list --objects --all`，
   `public/media/linkedin/*.jpg` 的 blob 数 **0**。最大的历史对象现在是
   `li-2371d55ac00a.webp`（285.7KB），第 4 名已经是 `package-lock.json`。
3. **内容与重写前一致，构建通过，页面正常** — PASS。全部在**新 clone**里做，不是本地旧仓库：
   64 张全尺寸 webp + 64 张缩略图、0 张 jpg；`npm run build` exit 0
   （`180 markdown files validated`）、`npx tsc --noEmit` exit 0；起服务后用 `devops.md` 里那条推导式
   检查跑，7 条路由全部 200；五个页面引用的每个 `/media/*` 资源都在磁盘上；浏览器打开 `/posts`
   62 张图、**0 破图**、媒体下载 142KB。
4. **备份可用** — PASS。见上，已实际 clone 还原并数出 141 个 jpg blob。

## Deviations

chore 没有 plan.md。一处超出工单字面 Scope：合并 PR #8 / #9 并删除 7 个陈旧远端分支。工单 Constraints
写了"必须先确认 0 个 open PR、0 个 worktree"，但没写这中间要做多少事——实际做了，都记在上面。

## Environment

- 验证用的全新 clone：`/Users/yong/work/intentplex-ws/verify-clone`（端口 53008，服务已停）
- 重写用的 mirror：`/Users/yong/work/intentplex-ws/rewrite-mirror`
- 备份：`/Users/yong/work/intentplex-ws/intentplex-backup-before-filter-repo/`
- 本机装了 `git-filter-repo`（`brew install`）。开发机工具，非仓库依赖。
- env key：无新增、无修改、无删除

## Residual

- **任何其他地方的 clone 都已作废**，必须重新 clone，不能 pull。目前只有本机这一份，已就地重建。
- **GitHub 上旧对象不会立刻消失**：那些 SHA 在一段时间内仍可通过直链访问，PR #1–#9 页面里引用的旧
  commit 会显示为孤立提交。这是 GitHub 的保留行为，不影响 clone 体积。若要强制回收需联系 GitHub 支持。
- **未部署。** 本工单不改运行中的站点内容。
- 早先未处理的：文章标题仍带 LinkedIn 后缀；Playwright 不在 `package.json` 里（`arch.md` redline 2）；
  若将来想要 CDN，正解是把 apex 在 Cloudflare 翻成橙云。
