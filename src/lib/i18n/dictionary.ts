/**
 * Centralised translation dictionary for Perso.
 *
 * Keys are dot-namespaced (e.g. `nav.home`). Missing entries in the
 * non-default locale fall back to English at lookup time so the app
 * stays usable while translation coverage is being filled in.
 *
 * `t("net.count", { count: 54 })` substitutes `{count}` placeholders.
 */

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

/** Native short label used on the toggle button. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  zh: "中",
};

/** Maps to the HTML `lang` attribute. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  zh: "zh-CN",
};

type Dict = Record<string, string>;

/**
 * English source strings. This is the source of truth — every key the
 * app uses must exist here.
 */
const en: Dict = {
  // Bottom navigation
  "nav.home": "Home",
  "nav.people": "People",
  "nav.add": "Add",
  "nav.search": "Search",
  "nav.ember": "Ember",

  // Common labels
  "common.seeAll": "See all",
  "common.more": "More",
  "common.back": "Back",
  "common.close": "Close",
  "common.dismiss": "Dismiss",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.retry": "Retry",
  "common.loading": "Loading…",
  "common.you": "You",
  "common.daysOverdue": "{count}d overdue",
  "common.catchUp": "Catch up",
  "common.addedAgo": "Added {time} ago",

  // Home page
  "home.greeting": "Hey there 👋",
  "home.subtitle": "{count} people in your network",
  "home.aria.more": "More",
  "home.quick.askEmber": "Ask Ember",
  "home.quick.map": "Map",
  "home.quick.add": "Add",
  "home.section.catchUp": "Catch up due",
  "home.section.recent": "Recently added",
  "home.ember.tryThis": "Try this",
  "home.ember.promptTitle": "“Who should I check in on?”",
  "home.ember.promptBody":
    "I’ll surface the friendships that need a little love.",
  "home.stat.fromApple": "From Apple",
  "home.stat.fromLinkedin": "From LinkedIn",
  "home.stat.overdue": "Overdue",

  // Language toggle
  "lang.switchTo": "Switch to {name}",
  "lang.current": "Current language: {name}",

  // People list
  "people.title": "People",
  "people.subtitle": "{count} in your network",
  "people.action.map": "Map",
  "people.action.sort": "Sort",
  "people.empty": "No one matches that filter yet.",

  // Map
  "map.title": "Your people, mapped",
  "map.subtitle": "Tap any face to open their profile.",
  "map.loading": "Loading map…",
  "map.notConfigured": "Map not configured yet",
  "map.error": "Couldn’t load the map",
  "map.view.location": "Location",
  "map.view.mind": "Mind map",
  "map.view.toggleAria": "Switch map view",
  "map.mind.title": "Who knows who",
  "map.mind.subtitle": "Tap any face to open their profile.",

  // Chat / Ember
  "chat.title": "Ember",
  "chat.subtitle": "Live agent · searches the web & your network",
  "chat.aboutAria": "About Ember",
  "chat.placeholder": "Ask Ember anything…",
  "chat.placeholderContact": "Ask about {name}…",
  "chat.thinking": "Ember is thinking",
  "chat.thinkingContact": "Asking Ember about {name}",
  "chat.opener":
    "Hey, I’m Ember — your friendship sidekick. Ask me who you should check in on, what you talked about last time you saw someone, or who in your circle might know the person you’re trying to meet.",
  "chat.openerContact":
    "Hey — ask me anything about {name}. I can summarise your history, suggest a check-in message, or pull in fresh info from their public profiles.",
  "chat.peopleReferenced": "People referenced",
  "chat.errorPrefix": "Couldn’t reach Ember.",
  "chat.mockNotice":
    "Showing offline reply · set OPENAI_API_KEY for the live agent",
  "chat.suggestions.title": "Try asking…",
  "chat.suggest.checkIn.title": "Who should I check in on?",
  "chat.suggest.checkIn.hint": "Surface friendships that are overdue",
  "chat.suggest.warmIntro.title": "Find me a warm intro to a VC",
  "chat.suggest.warmIntro.hint": "Map out the people-of-people I’d need",
  "chat.suggest.draftMessage.title": "Draft a check-in message",
  "chat.suggest.draftMessage.hint": "For a friend I’ve been missing",
  "chat.suggest.research.title": "Research someone I just met",
  "chat.suggest.research.hint": "Web-search their work & background",
  "chat.suggestContact.summary.title": "Summarise our history",
  "chat.suggestContact.summary.hint": "Last few touches, key moments",
  "chat.suggestContact.message.title": "Draft a check-in message",
  "chat.suggestContact.message.hint": "Warm, not transactional",
  "chat.suggestContact.mutuals.title": "Who do we both know?",
  "chat.suggestContact.mutuals.hint": "Find shared connections",
  "chat.suggestContact.update.title": "What have they been up to?",
  "chat.suggestContact.update.hint": "Public profiles, recent posts",

  // Search
  "search.title": "Search",
  "search.placeholder": "Search by name, place, tag…",
  "search.canned.title": "Try one of these",
  "search.canned.overdue": "Who haven’t I talked to recently?",
  "search.canned.investors": "Find an investor I can reach",
  "search.canned.friends": "Friends I should hang out with",
  "search.canned.travel": "People in my next city",
  "search.askEmber": "Ask Ember about “{query}”",
  "search.q.overdue.label": "Who should I check in on?",
  "search.q.overdue.desc": "Past their check-in cadence",
  "search.q.closest.label": "My closest friends",
  "search.q.closest.desc": "Best friends & partner",
  "search.q.family.label": "Family",
  "search.q.family.desc": "People I never want to neglect",
  "search.q.recent.label": "I met last quarter",
  "search.q.recent.desc": "Added in the past 90 days",
  "search.q.founders.label": "Founders in my network",
  "search.q.founders.desc": "Tagged founder · early-stage builders",
  "search.q.vcs.label": "Who do I know who knows VCs?",
  "search.q.vcs.desc": "Investors + warm-intro paths",
  "search.matches": "Matches",

  // Add
  "add.title": "Add a person",
  "add.closeAria": "Close",
  "add.import.title": "Import in bulk",
  "add.import.subtitle":
    "Tapping a source will open the platform’s native auth flow in a real build. None of these are wired up yet.",
  "add.audio.title": "Import from audio",
  "add.audio.uploadTitle": "Or upload a voice memo",
  "add.audio.uploadHint": "Drop a recording, or tap to pick one",
  "add.audio.uploadSpec":
    "mp3, m4a, wav, webm · up to 24MB. Your voice memo gets transcribed, then I’ll pull out every person mentioned.",
  "add.audio.privacy":
    "Audio is processed in memory and sent only to OpenAI for analysis. Nothing is stored on disk.",
  "add.manual.title": "Or add one manually",
  "add.manual.nameLabel": "Name",
  "add.manual.namePlaceholder": "Joshua Browder",
  "add.manual.headlineLabel": "Headline",
  "add.manual.headlinePlaceholder": "What they do, or how you’d describe them",
  "add.manual.placeLabel": "Where you met",
  "add.manual.placePlaceholder": "Coffee shop in SoMa",
  "add.manual.save": "Save person",

  // Source labels
  "source.appleContacts": "Apple Contacts",
  "source.linkedin": "LinkedIn",
  "source.instagram": "Instagram",
  "source.imessage": "iMessage",
  "source.audio": "Voice memo",
  "source.manual": "Added manually",
  "source.soon": "Soon",

  // More page
  "more.title": "More",
  "more.pro.title": "Perso Pro",
  "more.pro.subtitle":
    "Unlimited Ember prompts, deeper search, and an exportable timeline.",
  "more.section.network": "Network",
  "more.section.account": "Account",
  "more.integrations": "Integrations",
  "more.mapItem": "Map",
  "more.settings": "Settings",
  "more.library": "Library",
  "more.invite": "Invite a friend",
  "more.help": "Help & feedback",

  // Time helpers (kept short so they read naturally in subtitles)
  "time.today": "today",
  "time.yesterday": "yesterday",
  "time.daysAgo": "{count}d ago",
  "time.weeksAgo": "{count}w ago",
  "time.monthsAgo": "{count}mo ago",
  "time.yearsAgo": "{count}y ago",
  "time.never": "never",
};

/**
 * Simplified-Chinese translations. The English source is the
 * authoritative key list; missing keys here fall back to English at
 * lookup time so partial coverage never breaks the UI.
 */
const zh: Dict = {
  // Bottom navigation
  "nav.home": "首页",
  "nav.people": "人脉",
  "nav.add": "添加",
  "nav.search": "搜索",
  "nav.ember": "Ember",

  // Common labels
  "common.seeAll": "查看全部",
  "common.more": "更多",
  "common.back": "返回",
  "common.close": "关闭",
  "common.dismiss": "关闭",
  "common.save": "保存",
  "common.cancel": "取消",
  "common.retry": "重试",
  "common.loading": "加载中…",
  "common.you": "你",
  "common.daysOverdue": "已逾期 {count} 天",
  "common.catchUp": "去联络",
  "common.addedAgo": "{time}前添加",

  // Home page
  "home.greeting": "你好 👋",
  "home.subtitle": "你的人脉中有 {count} 位",
  "home.aria.more": "更多",
  "home.quick.askEmber": "问 Ember",
  "home.quick.map": "地图",
  "home.quick.add": "添加",
  "home.section.catchUp": "该联络了",
  "home.section.recent": "最近添加",
  "home.ember.tryThis": "试试这个",
  "home.ember.promptTitle": "「我该联系谁了？」",
  "home.ember.promptBody": "我来帮你找出最该被惦记的朋友。",
  "home.stat.fromApple": "来自 Apple",
  "home.stat.fromLinkedin": "来自 LinkedIn",
  "home.stat.overdue": "已逾期",

  // Language toggle
  "lang.switchTo": "切换为{name}",
  "lang.current": "当前语言：{name}",

  // People list
  "people.title": "人脉",
  "people.subtitle": "网络中共 {count} 位",
  "people.action.map": "地图",
  "people.action.sort": "排序",
  "people.empty": "暂无匹配的联系人。",

  // Map
  "map.title": "你的人脉地图",
  "map.subtitle": "点按任意头像即可打开档案。",
  "map.loading": "加载地图中…",
  "map.notConfigured": "地图尚未配置",
  "map.error": "无法加载地图",
  "map.view.location": "位置",
  "map.view.mind": "关系图",
  "map.view.toggleAria": "切换地图视图",
  "map.mind.title": "谁认识谁",
  "map.mind.subtitle": "点按任意头像即可打开档案。",

  // Chat / Ember
  "chat.title": "Ember",
  "chat.subtitle": "实时助手 · 可搜索网络与你的人脉",
  "chat.aboutAria": "关于 Ember",
  "chat.placeholder": "随便问 Ember…",
  "chat.placeholderContact": "问 Ember 关于 {name} 的事…",
  "chat.thinking": "Ember 正在思考",
  "chat.thinkingContact": "Ember 正在了解 {name}",
  "chat.opener":
    "你好，我是 Ember——你的友谊小助手。可以问我该联系谁了、上次见面聊了什么，或者你想认识的人在你的圈子里有谁认识。",
  "chat.openerContact":
    "嗨——关于 {name} 你想知道什么都可以问我。我可以总结你们的往来、帮你起草一段问候，或者整理一下他们公开档案上的最新动态。",
  "chat.peopleReferenced": "提到的人",
  "chat.errorPrefix": "无法连接到 Ember。",
  "chat.mockNotice": "正在显示离线回复 · 设置 OPENAI_API_KEY 启用实时助手",
  "chat.suggestions.title": "试试问…",
  "chat.suggest.checkIn.title": "我该联系谁了？",
  "chat.suggest.checkIn.hint": "找出已经逾期的朋友",
  "chat.suggest.warmIntro.title": "帮我找到 VC 的暖介绍",
  "chat.suggest.warmIntro.hint": "梳理出可以牵线搭桥的人",
  "chat.suggest.draftMessage.title": "写一条问候信息",
  "chat.suggest.draftMessage.hint": "给我一直惦记的朋友",
  "chat.suggest.research.title": "帮我了解一位新认识的人",
  "chat.suggest.research.hint": "联网搜索他们的背景与作品",
  "chat.suggestContact.summary.title": "梳理一下我们的往来",
  "chat.suggestContact.summary.hint": "最近几次互动与关键节点",
  "chat.suggestContact.message.title": "起草一条问候信息",
  "chat.suggestContact.message.hint": "走心，不要套路",
  "chat.suggestContact.mutuals.title": "我们共同认识谁？",
  "chat.suggestContact.mutuals.hint": "查找共同的连接",
  "chat.suggestContact.update.title": "他们最近在忙什么？",
  "chat.suggestContact.update.hint": "查看公开档案与最新动态",

  // Search
  "search.title": "搜索",
  "search.placeholder": "按姓名、地点、标签搜索…",
  "search.canned.title": "试试这些",
  "search.canned.overdue": "我最近没联系过谁？",
  "search.canned.investors": "找一位我能联系的投资人",
  "search.canned.friends": "应该约出来的朋友",
  "search.canned.travel": "下一站城市里有谁",
  "search.askEmber": "问 Ember 关于「{query}」",
  "search.q.overdue.label": "我该联系谁了？",
  "search.q.overdue.desc": "已超过设定的联络频率",
  "search.q.closest.label": "最亲近的朋友",
  "search.q.closest.desc": "挚友与伴侣",
  "search.q.family.label": "家人",
  "search.q.family.desc": "永远不想忽略的人",
  "search.q.recent.label": "最近一个季度认识的",
  "search.q.recent.desc": "近 90 天新加入",
  "search.q.founders.label": "我人脉里的创始人",
  "search.q.founders.desc": "标签：创始人 · 早期建设者",
  "search.q.vcs.label": "我认识的人里谁认识 VC？",
  "search.q.vcs.desc": "投资人与暖介绍路径",
  "search.matches": "匹配结果",

  // Add
  "add.title": "添加联系人",
  "add.closeAria": "关闭",
  "add.import.title": "批量导入",
  "add.import.subtitle":
    "点按任一来源会在正式版中打开对应平台的授权流程。当前演示均未接入。",
  "add.audio.title": "从录音导入",
  "add.audio.uploadTitle": "或上传一段语音备忘录",
  "add.audio.uploadHint": "拖入或点按选择一段录音",
  "add.audio.uploadSpec":
    "mp3、m4a、wav、webm，单文件 24MB 以内。我会把录音转写并提取其中提到的每一位人物。",
  "add.audio.privacy":
    "录音仅在内存中处理并发送给 OpenAI 分析，不会写入磁盘。",
  "add.manual.title": "或手动添加一位",
  "add.manual.nameLabel": "姓名",
  "add.manual.namePlaceholder": "张三",
  "add.manual.headlineLabel": "简介",
  "add.manual.headlinePlaceholder": "他/她在做什么，或者你眼中的他/她",
  "add.manual.placeLabel": "在哪里认识的",
  "add.manual.placePlaceholder": "SoMa 的一家咖啡店",
  "add.manual.save": "保存",

  // Source labels
  "source.appleContacts": "Apple 通讯录",
  "source.linkedin": "领英",
  "source.instagram": "Instagram",
  "source.imessage": "iMessage",
  "source.audio": "语音备忘录",
  "source.manual": "手动添加",
  "source.soon": "即将推出",

  // More page
  "more.title": "更多",
  "more.pro.title": "Perso Pro",
  "more.pro.subtitle":
    "无限次的 Ember 对话、更深的搜索，以及可导出的时间线。",
  "more.section.network": "网络",
  "more.section.account": "账户",
  "more.integrations": "集成",
  "more.mapItem": "地图",
  "more.settings": "设置",
  "more.library": "资料库",
  "more.invite": "邀请朋友",
  "more.help": "帮助与反馈",

  // Time helpers
  "time.today": "今天",
  "time.yesterday": "昨天",
  "time.daysAgo": "{count} 天前",
  "time.weeksAgo": "{count} 周前",
  "time.monthsAgo": "{count} 个月前",
  "time.yearsAgo": "{count} 年前",
  "time.never": "尚未联系",
};

const TRANSLATIONS: Record<Locale, Dict> = { en, zh };

/* -------------------------------------------------------------------------- */
/* Lookup                                                                     */
/* -------------------------------------------------------------------------- */

export type Translator = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

/**
 * Resolve a translation key for the given locale, falling back to the
 * English source if missing. Interpolates `{name}` placeholders.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const source =
    TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS[DEFAULT_LOCALE][key] ?? key;
  if (!vars) return source;
  return source.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

export function makeTranslator(locale: Locale): Translator {
  return (key, vars) => translate(locale, key, vars);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
