import { reactive, ref } from 'vue';

const translations = {
    en: { title: "Ask Me Anythings", ask: "Ask Tive◎AI anything", discovery: "AI Discovery", map: "AI Map", notebook: "Notebook", thinking: "Thinking..", history: "Back", settings: "Settings", language: "Language", appearance: "Appearance", cognitive: "Synchronizing Cognitive Assets" },
    ja: { title: "Ask Me Anythings", ask: "Tive◎AIに質問してみましょう", discovery: "AI発見", map: "AIマップ", notebook: "ノートブック", thinking: "思考中..", history: "戻る", settings: "設定", language: "言語", appearance: "外観", cognitive: "認知資産を同期中" },
    es: { title: "Ask Me Anythings", ask: "Pregunta cualquier cosa a Tive◎AI", discovery: "Descubrimiento AI", map: "Mapa AI", notebook: "Cuaderno", thinking: "Pensando..", history: "Volver", settings: "Ajustes", language: "Idioma", appearance: "Apariencia", cognitive: "Sincronizando activos cognitivos" },
    // Simplified, keeping it consistent for now
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

// Apply theme on load
if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('light-mode', theme.value === 'light');
}

export const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('tive_theme', theme.value);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('light-mode', theme.value === 'light');
  }
};
