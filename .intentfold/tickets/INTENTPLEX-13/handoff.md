# INTENTPLEX-13 — 检查把重定向当失败；并删掉 charter 的授权门槛

Type: chore。Finish: auto-deploy。

## 一、部署后检查

顶栏加了 Admin 之后，首页多了 `/admin` 这个链接，检查从首页推导路由时把它算进来，
而它**按设计就该 302** → 判定失败。生产是好的：23 条内容路由全 200、revision Healthy。
错的是检查。

不往 `devops.md` 里写死 `/admin`——那正是它「与业务无关」原则要防的，也是 INTENTPLEX-5
修过的毛病。改成业务无关的规则：

- **3xx = 这不是一个内容页**，打印并跳过。跟着它走会落到不属于本站的地方，没什么可判断的。
- **`pages` 计数替它当守卫**：至少要有一个路由回来是真页面。所以全站开始 302 时，
  即便推导成功，检查仍然失败。

比原来更严：原规则下「推导有结果但全是重定向」会安静通过。

## 二、charter 授权门槛

删掉「必须人类说出『我亲自同意修改charter』才能改 charter」这条。三处：技能 `SKILL.md`、
技能模板 `references/templates/charter/format.md`、本仓库 `.intentfold/charter/format.md`。

**没有连带删掉的那层意思**：charter 仍然是人类拥有的，agent 仍然不得自作主张改它——
比如做工单做到一半觉得某条规则碍事就重写，或者把 charter 改成迎合自己刚写的代码。
去掉的是那句咒语式的授权要求；「人类要求改才改」这条留着。

这条规则当初是应人类要求加的（INTENTPLEX-5），现在应人类要求删除。

## AC results

1. **线上跑检查 exit 0，`/admin` 显示为重定向** — PASS。7 个内容页全 200，
   `302 /admin (redirect — not a content page)`，`OK: 7 pages`。
2. **全站重定向时仍失败** — PASS。起了一个除首页外一律 302 的本地服务：
   两条路由都打印为 redirect，随后 `FAIL: nothing answered with a page`，exit 1。
3. **`devops.md` 无写死路由名** — PASS。
4. **三处不再要求那句话** — PASS。grep 只剩历史工单记录里的引用，那是当时的事实记载，不改。
