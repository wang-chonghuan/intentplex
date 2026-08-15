# intentplex
personal website

Name: Yong Wang
Profile: CTO in an Irish AI fintech startup located in Dublin, 我也爱写文章和开发side project，兴趣是哲学，教育，桌游

tech stack:

tanstack start (vite, typescript)
astryx (Theme: stone) 严格服从其设计系统，禁止改变，开发完要落一个DESIGN.md文件描述这个严格的设计系统
https://astryx.atmeta.com/themes?theme=stone
sytlex
no tailwind at all

use find-docs skill (context 7) to get all the latest documenation in this tech stack

需求：
个人网站，要求支持中文和英文双语切换，默认英文
topbar上有几个按钮，切换页面，分为：
首页
我的posts
我的文章
我的作品
我的媒体矩阵
（本网站的所有wording，中英文wording你都自己决定，基于我的意思，要自然的中文和英文）
每个里面放一些mockup的内容，具体的产品设计，你自己决定

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm run preview   # production build, served locally
npm run typecheck
```

## Where things live

| Path | What |
| --- | --- |
| [`.intentfold/readme.md`](.intentfold/readme.md) | Session entry point. Routes to this project's intent and its ticket workflow — no product change without a ticket. |
| [`.intentfold/charter/ui.md`](.intentfold/charter/ui.md) | The Astryx / stone design system this site obeys, and the rules for touching it. Read before changing any UI. (This is where `DESIGN.md` went.) |
| `src/routes/` | One file per page: `index` (首页), `posts` (动态), `essays` (文章), `work` (作品), `media` (媒体矩阵) |
| `src/content/` | All copy, as `{en, zh}` objects. Both languages are written in the same literal, so a missing translation is a type error. |
| `src/components/` | The shell: `SiteProviders` (theme + locale + link adapter), `SiteShell` (top nav + page column), the two switches |
| `src/styles/` | `app.css` (cascade order + vendor imports) and `tokens.stylex.ts` (the only place a design token may be named) |
| `.claude/CLAUDE.md` | Astryx's component index for coding agents, written by `npx astryx init` |

Language defaults to English and is remembered per browser; colour mode
follows the OS unless overridden.
