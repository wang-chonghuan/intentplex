import type {L10n} from '~/i18n/locale';

/**
 * Everything the admin says, in both languages.
 *
 * The admin was written in Chinese only while the public site had been bilingual
 * from the start — one site, two rules. It reads through the same `t()` and the
 * same `L10n` shape as `site.ts`; there is no second i18n mechanism here, and
 * adding one would be the defect.
 *
 * English is the default, as it is everywhere else on this site.
 */
export const adminCopy = {
  // "Admin" stays "Admin" in both. It is a destination for one person who reads
  // both languages, and 管理 reads like a section of the site rather than a door.
  nav: {en: 'Admin', zh: 'Admin'} satisfies L10n<string>,

  pending: {
    heading: {en: 'Waiting on you', zh: '待发送'},
    lede: {
      en: 'These were approved here, but posting needs your signed-in browser — the site cannot do it. Run this in Claude Code:',
      zh: '这些已经在这里批准了，但发帖需要你已登录的浏览器，站点自己做不到。在 Claude Code 里跑：',
    },
    command: {en: '/ipsl-syndicate', zh: '/ipsl-syndicate'},
    empty: {en: 'Nothing waiting.', zh: '没有待发送的。'},
    stuck: {
      en: 'Claimed by a sender that never finished. It needs looking at, not another run.',
      zh: '被某次发送认领后没有收尾。需要人看一眼，而不是再跑一次。',
    },
  } satisfies Record<string, L10n<string>>,

  index: {
    heading: {en: 'Admin', zh: '后台'},
    write: {en: 'Write', zh: '写新的'},
    draft: {en: 'Draft', zh: '草稿'},
    noLanguages: {en: '—', zh: '—'},
  } satisfies Record<string, L10n<string>>,

  denied: {
    heading: {en: 'Not you', zh: '进不去'},
    body: {
      en: 'This admin is open to exactly one GitHub account, and it is not this one.',
      zh: '这个后台只对一个 GitHub 账号开放，而你不是它。',
    },
    home: {en: 'Back to the site', zh: '回到站点'},
  } satisfies Record<string, L10n<string>>,

  editor: {
    newHeading: {en: 'Write', zh: '写新的'},
    title: {en: 'Title (Chinese)', zh: '标题（中文）'},
    slug: {en: 'Slug', zh: 'slug'},
    date: {en: 'Date', zh: '日期'},
    kind: {en: 'Kind', zh: '类型'},
    kindPost: {en: 'Post', zh: '动态'},
    kindArticle: {en: 'Article', zh: '文章'},
    kindWork: {en: 'Work', zh: '作品'},
    cover: {en: 'Cover image', zh: '封面图'},
    coverNone: {en: 'Not set', zh: '未设置'},
    coverChoose: {en: 'Choose a cover', zh: '选择封面'},
    view: {en: 'View', zh: '视图'},
    viewWrite: {en: 'Write', zh: '写'},
    viewPreview: {en: 'Preview', zh: '预览'},
    body: {en: 'Body (Chinese Markdown)', zh: '正文（中文 Markdown）'},
    bodyPlaceholder: {
      en: 'Paste or drop a picture to insert it',
      zh: '粘贴或拖入图片即可插入',
    },
    bodyEmpty: {en: '(nothing written yet)', zh: '（还没有正文）'},
    publish: {en: 'Publish', zh: '发布'},
    saveDraft: {en: 'Save draft', zh: '存草稿'},
    uploading: {en: 'Uploading…', zh: '上传中…'},
    inserted: {en: 'Inserted ', zh: '已插入 '},
    uploadingCover: {en: 'Uploading the cover…', zh: '上传封面…'},
    publishing: {en: 'Publishing…', zh: '发布中…'},
    saving: {en: 'Saving…', zh: '保存中…'},
    published: {en: 'Published', zh: '已发布'},
    savedDraft: {en: 'Saved as a draft', zh: '已保存为草稿'},
    nextStep: {en: 'Generate and syndicate', zh: '生成与同步'},
    nextStepHint: {
      en: 'Save first, then generate the English version and the four platform posts.',
      zh: '保存之后即可生成英文版与四个平台版本。',
    },
  } satisfies Record<string, L10n<string>>,

  syndicate: {
    heading: {en: 'Generate and syndicate', zh: '生成与同步'},
    lede: {
      en: 'The Chinese original is the only thing written by hand. The English site version and the four platform posts are generated here, and you read them before anything is published.',
      zh: '中文原文是唯一手写的。英文站点版与四个平台版本都由这里生成，发布前你要读过。',
    },
    generate: {en: 'Generate all five', zh: '生成五份'},
    generating: {en: 'Generating, five of them…', zh: '生成中，五份…'},
    englishHeading: {en: 'English site version', zh: '英文站点版'},
    generatedBadge: {en: 'Generated — read it', zh: '机器生成，需你过目'},
    englishTitle: {en: 'English title', zh: '英文标题'},
    englishBody: {en: 'English body', zh: '英文正文'},
    saveEnglish: {en: 'Save the English version', zh: '保存英文版'},
    platformsHeading: {en: 'The four platforms', zh: '四个平台'},
    send: {en: 'Send', zh: '发送'},
    skip: {en: "Don't send", zh: '不发'},
    view: {en: 'Look at it', zh: '看一眼'},
  } satisfies Record<string, L10n<string>>,

  status: {
    draft: {en: 'Draft', zh: '草稿'},
    approved: {en: 'Approved — waiting for the local sender', zh: '已批准，等待本机发送'},
    posting: {en: 'Sending', zh: '发送中'},
    posted: {en: 'Sent', zh: '已发送'},
    skip: {en: 'Not going to this platform', zh: '不发这个平台'},
  } satisfies Record<string, L10n<string>>,

  errors: {
    uploadFailed: {en: 'Upload failed: ', zh: '上传失败：'},
    saveFailed: {en: 'Save failed: ', zh: '保存失败：'},
    generateFailed: {en: 'Generation failed: ', zh: '生成失败：'},
  } satisfies Record<string, L10n<string>>,
} as const;
