# INTENTPLEX-9 — 议定中的做法

**状态：讨论进行中。** 这份文件是活的，随讨论修订；不是最终方案。人类要求"一个单子完成"，
所以下面的阶段是**交付顺序**，不是拆单依据。

因为走 draft 路线（approach 在对话里议定），本工单不 grill。

---

## 1. 一个约束决定了整体形状

**发送必须发生在有 Chrome 会话的地方——人类的电脑，不是 Azure 容器里。**

`ips-linkedin` 能成立，是因为它借的是已登录的浏览器会话。跑在 Azure 容器里的按钮驱动不了本机
Chrome。所以"点按钮就发出去"只有两种实现：

| | 评价 |
|---|---|
| 服务端存平台 cookie 代发 | 会过期、会被风控、多一堆密钥。**不采用** |
| 按钮是"批准"，本机 skill 消费队列 | 架构诚实。人类本来就坐在电脑前写，手感一样。**采用** |

准确的说法：**网页端是工作台，发送是本地的。**

## 2. 已定的决策（2026-08-15 人类确认）

1. **先有数据库。**
2. **存量全部迁进库**——现有文章与 posts 以 markdown + 图片的形式存进 Postgres，
   **渲染效果必须和现在一样**。（这一条推翻了早先"存量留文件"的倾向。）
3. **图片也存进库。**
4. **GitHub 登录。**
5. **写新文章要配图：封面图与插图都由人类自己上传。** 不做自动生成卡片图。
6. **X 基本双语，但会各自修改** —— 一份源渲染出中英两版，两版之后各改各的。
   不是两条独立内容线。
7. **AI 生成的多平台版本要存下来**，可反复修改。
8. **原文一律中文。** 人类在后台用中文写，**网站英文版和其余所有版本都是 AI 生成的**。

不做视频。

### 由第 8 条推出的：一个手写源 → 五份生成

```
中文原文（唯一手写的东西）
  ├─ 网站英文版        rendition(lang=en)   ← 常驻站点，权重最高，必须认真审
  ├─ X 中文            syndication(x-zh)
  ├─ X 英文            syndication(x-en)
  ├─ LinkedIn          syndication(linkedin)
  └─ 微博              syndication(weibo)
```

**编辑器是单栏中文**，不需要并排双栏。

**分两阶段，别挤在一个界面里。** 人类原话是"我发一篇文章…然后…同步发到"，本来就是两步：

1. **发布**：写中文 → 生成英文版 → 审 → 发布，站点上线（中英各一份）
2. **同步**：生成四个平台版本 → 审 → 批准 → 本机 skill 发出去

一次审 1 份、一次审 4 份，比一次性面对 5 份好得多——尤其这是日更。
而且英文站点版是常驻资产，值得单独一屏认真看；平台版本是速朽的，扫一眼就行。

## 3. 让"渲染一样"从目标变成可证明的

**图片进库后，URL 形状保持不变**：仍然是 `/media/linkedin/li-<hash>.webp`，只是这个路由改为
从 Postgres 读、不再从磁盘读。于是 180 篇正文里的图片引用**一个字都不用改**，迁移前后渲染出的
HTML 可以做到**逐字节相同**。

验收就用这个：迁移前把全部 23 条路由的 HTML 抓下来，迁移后再抓一遍，`cmp` 逐字节比对。
"看起来一样"无法判定，"逐字节相同"可以。

（唯一预期差异是路由 match 的时间戳 `u:<epoch>`，每次请求本就不同——比对时需要把它规范化掉。
这一点在 INTENTPLEX-8 比对本地与线上 SSR HTML 时已经遇到过。）

## 4. 数据分工

| 数据 | 放哪 |
|---|---|
| 全部内容正文（存量 + 新写） | Postgres |
| 全部图片（存量 128 张 + 新上传） | Postgres `bytea` |
| AI 生成的四个平台版本、人类的修改、发布状态与远端 URL | Postgres |

`src/content/loader.ts` 现在是构建期 `import.meta.glob` 读文件，**要改成运行时从数据库读**。
这是需要动的核心代码。

**代价与对策**：站点从此有了运行时依赖，库挂了站就挂了；而现在它零运行时依赖。
对策是进程内缓存，发布时失效——180 条内容极小，全量常驻内存毫无压力，
数据库抖动不会立刻带塌站点。

**构建期校验失效**：`validate.ts` + Vite 插件现在能让坏内容在构建时按文件名报错。
内容进库后这层保护没有了，校验必须挪到**写入时**（后台表单提交那一刻）。
`validate.ts` 仍然是唯一的 schema 定义，只是调用点从构建插件变成写路径。

**导出回仓库**：内容全进库之后，git 里就没有正文了——那意味着人类的写作只剩数据库一份，
而它跑在一个 Burstable 实例上。所以**发布时把 markdown + 图片导出回仓库**这条从"锦上添花"
升级为**必要项**，它是写作资产的唯一备份和版本历史。

## 5. 表结构草案（待讨论）

注意两个不同的轴，别混：**rendition = 语言版本**（站点自己的中英文，现有概念），
**syndication = 平台版本**（X 中/英、LinkedIn、微博）。

```
entry        id, kind(post|article|work), slug, date, cover_media_id,
             status(draft|published), created_at, updated_at
rendition    id, entry_id, lang(en|zh), title, body_md, source_url
             -- 站点的语言版本；一个 entry 至少一条
media        id, sha256, mime, width, height, bytes, thumb_bytes, created_at
             -- 对外路径由 sha256 决定，形状与现有一致
syndication  id, entry_id, channel(x-en|x-zh|linkedin|weibo),
             body, status(draft|approved|posting|posted|skip),
             remote_url, posted_at, updated_at
             -- 一个 entry 四条；生成后可反复改
```

发送幂等靠 `syndication.status`：先写 `posting`，拿到 `remote_url` 再改 `posted`。
读错了重来无所谓，发重了就是四条重复帖子。

## 6. 基础设施——不需要新建任何东西

n-easyapp 早就为这个项目开好了库（2026-08-15 核实）：

```
pg-easyapp-shared   Postgres 16   Burstable   32GB   state=Ready
  database  easyapp
  schema    intentplex-schema
  user      intentplex-user
```

连接串在 n-easyapp cap2 的输出里。容器目前**没有**挂 `DATABASE_URL`，加上即可——但见下面的 redline。

## 7. 几个具体做法

- **登录**：GitHub OAuth，锁死人类本人的单一 user id。单用户不值得自建密码体系。
- **上传**：编辑器里粘贴或拖入 → 服务端按 INTENTPLEX-7 那套管线处理（长边 1280、
  `cwebp -q 82`，另出 128px 缩略图）→ 按内容哈希入库 → 返回 `/media/...` 路径插进 markdown。
  这样新图和存量图形状一致，站点重量维持在现在的水平。
- **封面图**：就是现有 frontmatter 的 `image:` 字段，对应 `entry.cover_media_id`。
- **图片路由**：必须继续发 `cache-control: public, max-age=31536000, immutable`
  （内容哈希决定路径，天然不可变）。

四个平台的形状约束（"生成四份"不是把同一段话发四遍）：

| | 篇幅 | 决定成败的地方 |
|---|---|---|
| X 英文 | 280 字符 | thread 是一等公民，一个产品一条最自然 |
| X 中文 | 280 字符 | 中文单位字符信息量是英文两三倍，同样长度能塞下一整段 |
| LinkedIn | ~3000 | 真正决定阅读率的是 "see more" 之前那 200 字符 |
| 微博 | ~2000 | 图几乎是必须的，话题要 `#话题#` 包起来 |

## 7b. slug 从哪来——中文原文带出的一个真问题

现在的 slug 来自文件名，而文件名是从英文标题派生的。原文改成中文之后，slug 不能直接用中文标题
（URL 会变成一串 percent-encoding，既不可读也不好分享）。

**做法：slug 由 AI 生成的英文标题派生。** 英文版反正要生成，顺手拿它的标题做 slug，
URL 保持现在这种可读的英文形状（`/articles/can-agents-safely-rewrite-themselves`），
和存量 180 篇完全一致。

slug 一旦发布就冻结——之后改标题不改 slug，否则外部链接会断。

## 8. 会撞到的三条 redline / charter 冲突

1. **`arch.md` Contract 与 redline 4**：现在写着"没有数据库、没有认证、没有服务端数据源"，
   这三样这次全要破。
2. **`ui.md` Guidance「Content and tone」**：现在写着
   *"Both languages are written by a person who means them — the Chinese is not a translation of
   the English, and neither is filler."* 新模型下这句**变成假的**：中文是唯一手写的，英文是
   机器翻译加人工审核。INTENTPLEX-4 刚修过这段的另一半（条目不受双语类型保证约束），
   这一半这次也得改。
3. **`devops.md` redline 3**：给容器加 `DATABASE_URL` 属于"服务需要一个它原本没有的环境变量"，
   **那次部署需要人类点头**。

前两条都要改 charter，**需要人类说出「我亲自同意修改charter」**——不是现在，是真要动手改
charter 那一刻。

## 9. 交付顺序（一个工单内部的顺序，不是拆单）

1. **库 + 迁移 + 运行时读库。** 存量全部进库，图片进库，路由形状不变，
   迁移前后 HTML 逐字节比对通过。**站点行为零变化**——这一步没有任何新功能，
   纯粹是把地基从文件换成数据库。
2. **GitHub 登录 + 后台 + 编辑器 + 图片上传。** 能在后台写一篇带封面和插图的文章并发布。
3. **AI 生成四份 + 审核界面 + 存下来可改。**
4. **队列 + 本机 skill，打通 LinkedIn**（ips-linkedin 已趟过会话与接口形状），
   再铺到 X 两个号与微博。

## 10. 还没定的（都不挡住第 1 步）

第 1 步是零功能的地基迁移，下面这些不影响它，可以边做边定。

- **`works` 集合一起迁**（已决定）。人类说的是"文章和 posts"，但把 works 留在文件里会让
  `loader.ts` 同时维护两条读取路径，不值得。
- **每天几条**：决定 X 上发 thread 还是单条。
- **日更摘要要不要单独成集合**：暂按普通 post 处理，待定。
- **存量 180 篇要不要补中文版？** 它们全是英文，中文站点看到的是英文原文加提示。
  管线建好之后这是一次性批量作业，很便宜。**不在本工单范围内**，但值得记着。
