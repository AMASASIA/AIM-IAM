import { reactive, ref } from 'vue';

const translations = {
    en: { ask: "Ask Tive◎AI anything", discovery: "AI Discovery", map: "AI Map", notebook: "Notebook", thinking: "Thinking..", history: "Back", settings: "Settings", language: "Language", appearance: "Appearance", cognitive: "Synchronizing Cognitive Assets" },
    ja: { ask: "Tive◎AIに質問してみましょう", discovery: "AI発見", map: "AIマップ", notebook: "ノートブック", thinking: "思考中..", history: "戻る", settings: "設定", language: "言語", appearance: "外観", cognitive: "認知資産を同期中" },
    // Simplified for now, can add others if needed
};

export const i18n = reactive({
    locale: localStorage.getItem('tive_locale') || 'en',
    setLocale(l) {
        this.locale = l;
        localStorage.setItem('tive_locale', l);
    },
    t(key) {
        return translations[this.locale]?.[key] || translations['en'][key] || key;
    }
});

export const theme = ref(localStorage.getItem('tive_theme') || 'dark');
export const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('tive_theme', theme.value);
  document.documentElement.classList.toggle('light-mode', theme.value === 'light');
};
