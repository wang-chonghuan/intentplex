import type {L10n} from '~/i18n/locale';

export const home = {
  /** Deliberately not translated — the equation reads the same either way. */
  headline: 'Intents × AI = Silicon species',
  intro: {
    en: 'I am Yong Wang — a builder, and CTO at an AI fintech startup in Dublin. Days go into AI agent architecture, harness engineering, product engineering and running a team. Evenings go into building side projects, writing, and thinking.',
    zh: '我是 Yong Wang，builder，在都柏林的一家 AI 金融科技创业公司做 CTO。白天的时间花在 AI Agent 架构、Harness engineering、产品工程、团队管理。晚上的时间留给构建 side projects、写作和思考。',
  } satisfies L10n<string>,
  recentHeading: {en: 'Recent', zh: '最近动态'} satisfies L10n<string>,
} as const;
