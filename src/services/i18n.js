import { reactive, ref } from 'vue';

const translations = {
  en: {
    ask: "Ask Tive◎AI anything",
    thinking: "Thinking..",
    notebook: "Notebook",
    discovery: "Discovery",
    memos: "Memos",
    map: "AI Map",
    copy: "Copy",
    oke: "OKE",
    sign: "Sign",
    clear: "Clear",
    settings: "Settings",
    appearance: "Appearance",
    language: "Language",
    history: "History"
  },
  ja: {
    ask: "Tive◎AIに質問してみましょう",
    thinking: "思考中..",
    notebook: "ノートブック",
    discovery: "ディスカバリー",
    memos: "メモ",
    map: "AI マップ",
    copy: "コピー",
    oke: "OKE",
    sign: "サイン",
    clear: "クリア",
    settings: "設定",
    appearance: "外観",
    language: "言語",
    history: "履歴"
  },
  // Add 10 more languages... (Simplified for brevity in bridge, full list in final)
};

export const i18n = reactive({
  locale: localStorage.getItem('tive_lang') || 'ja',
  t(key) {
    const lang = translations[this.locale] || translations.en;
    return lang[key] || translations.en[key] || key;
  },
  setLocale(l) {
    this.locale = l;
    localStorage.setItem('tive_lang', l);
  }
});

export const theme = ref(localStorage.getItem('tive_theme') || 'dark');
export const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('tive_theme', theme.value);
  document.documentElement.classList.toggle('light-mode', theme.value === 'light');
};
