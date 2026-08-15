# INTENTPLEX-10 — 改掉 ui.md 里与「中文手写、英文生成」新模型冲突的双语措辞

Type: chore（无 plan.md / ac.md / grill）。人类在会话中说出「我亲自同意修改charter」，本工单据此
获准修改 `.intentfold/charter/`。

## What changed

只改 `charter/ui.md` `## Guidance` 的「Content and tone」一段。产品代码 0 行改动，
`arch.md` / `devops.md` 0 行改动。

**删掉的两处，它们都跟 INTENTPLEX-9 议定的新模型直接冲突：**

1. *"Both languages are written by a person who means them — the Chinese is not a translation of the
   English, and neither is filler."* 新模型下中文是唯一手写的，英文由生成而来。
2. *"...because the alternative is either hiding a post until it is translated or **shipping a machine
   translation**."* 这句把发布机器翻译当作应当避免之事，用以论证条目为何不必双语——而新模型正是
   要做这件事。

**换上的不是空缺，是一条新约束：**

> An entry is authored in Chinese; its English version is generated, and the author reads it before
> it is published. The review is the rule here, not the generation — an English version nobody read
> is not publishable, because publishing it puts words under the author's name that the author has
> never seen. Edit it until it is what you would have written, or do not publish it.

只把旧规则删掉的话，这段就只剩「英文是机器生成的」这一句事实陈述，不再约束任何人——而 Guidance
的作用恰恰是约束写作的人（`format.md`：Guidance is binding，由作者在写作时自行判断是否做到）。
新写法把约束点从「谁写的」挪到「谁读过」，那才是真正决定质量的地方。

同时说明了存量：导入的存档早于这条规则、只有英文，保持原样。

段落里仍然成立的部分原样保留：站点外壳由 `L10n` 保证双语；语气规范；`<html lang>` 跟随 locale。

## AC results

1. **charter 全文已无旧说法** — PASS。对三处措辞
   （`written by a person who means them`、`not a translation of the English`、
   `shipping a machine translation`）全目录 grep，无结果。
2. **新约束写明** — PASS。`ui.md:286` 起：`An entry is authored in Chinese; its English version is
   generated, and the author reads it before it is published`，并明确 `is not publishable`。
3. **范围** — PASS。`git status` 只有 `ui.md` 与本工单目录；`arch.md`、`devops.md` 各 0 行改动；
   `src` / `public` / `content` / `server.mjs` / `vite.config.ts` / `package.json` 共 0 个文件改动。
4. **构建与类型检查** — PASS。`npm run build` exit 0（`180 markdown files validated`），
   `npx tsc --noEmit` exit 0。

## Deviations

**刻意不改 `arch.md`**，尽管它关于「没有数据库、没有认证、没有服务端数据源」的陈述同样会被
INTENTPLEX-9 推翻。理由是这两段的**性质不同**：

- `ui.md` 这段是 **Guidance**——规定作者该怎么做。人类此刻就做了这个决定，此刻记下来是对的。
- `arch.md` 那段是 **Contract**——陈述系统**是什么**。现在确实还没有数据库；此刻改掉，charter
  就在描述一个不存在的系统。它该在数据库真正落地那一刻改。

这跟 `format.md` 里「redline 陈述它的判据，而不是今天的答案」是同一个毛病的两面：charter 不该
提前描述尚未成为事实的东西。

## Environment

- worktree：`/Users/yong/work/intentplex-ws/intentplex--INTENTPLEX-10`
- 端口：web 53010 已分配但未使用——本工单只改文档，判据是 grep 与构建，不需要起服务。
- env key：无新增、无修改、无删除。

## Residual

- **`arch.md` 的 Contract 仍与 INTENTPLEX-9 的目标冲突**，按上面的理由留到数据库落地时改。
  届时仍需人类重新说出「我亲自同意修改charter」——这次的授权只覆盖本工单。
- INTENTPLEX-9 的 `draft.md` 第 8 节记录了三条待撞的 redline / charter 冲突，本工单消掉其中第 2 条。
