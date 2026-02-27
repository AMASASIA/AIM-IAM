import { reactive, ref } from 'vue';

const translations = {
    en: { ask: "Ask Tive◎AI anything", discovery: "Discovery", map: "AI Map", notebook: "Notebook", thinking: "Thinking..", history: "Back", settings: "Settings", language: "Language", appearance: "Appearance" },
    ja: { ask: "Tive◎AIに質問してみましょう", discovery: "発見", map: "AIマップ", notebook: "ノートブック", thinking: "思考中..", history: "戻る", settings: "設定", language: "言語", appearance: "外観" },
    es: { ask: "Pregunta cualquier cosa a Tive◎AI", discovery: "Descubrimiento", map: "Mapa AI", notebook: "Cuaderno", thinking: "Pensando..", history: "Volver", settings: "Ajustes", language: "Idioma", appearance: "Apariencia" },
    fr: { ask: "Demandez n'importe quoi à Tive◎AI", discovery: "Découverte", map: "Carte AI", notebook: "Carnet", thinking: "Réflexion..", history: "Retour", settings: "Paramètres", language: "Langue", appearance: "Apparence" },
    de: { ask: "Fragen Sie Tive◎AI alles", discovery: "Entdeckung", map: "KI-Karte", notebook: "Notizbuch", thinking: "Nachdenken..", history: "Zurück", settings: "Einstellungen", language: "Sprache", appearance: "Aussehen" },
    zh: { ask: "询问 Tive◎AI 任何事情", discovery: "发现", map: "AI地图", notebook: "笔记本", thinking: "思考中..", history: "返回", settings: "设置", language: "语言", appearance: "外观" },
    ko: { ask: "Tive◎AI에게 무엇이든 물어보세요", discovery: "발견", map: "AI 지도", notebook: "노트북", thinking: "생각 중..", history: "뒤로", settings: "설정", language: "언어", appearance: "화면 설정" },
    it: { ask: "Chiedi qualsiasi cosa a Tive◎AI", discovery: "Scoperta", map: "Mappa AI", notebook: "Taccuino", thinking: "Pensando..", history: "Indietro", settings: "Impostazioni", language: "Lingua", appearance: "Aspetto" },
    pt: { ask: "Pergunte qualquer coisa ao Tive◎AI", discovery: "Descoberta", map: "Mapa AI", notebook: "Caderno", thinking: "Pensando..", history: "Voltar", settings: "Configurações", language: "Idioma", appearance: "Aparência" },
    ru: { ask: "Спросите Tive◎AI о чем угодно", discovery: "Открытие", map: "AI Карта", notebook: "Блокнот", thinking: "Думаю..", history: "Назад", settings: "Настройки", language: "Язык", appearance: "Внешний вид" },
    ar: { ask: "اسأل أي شيء لـ Tive◎AI", discovery: "اكتشاف", map: "خريطة AI", notebook: "دفتر", thinking: "تفكير..", history: "رجوع", settings: "إعدادات", language: "اللغة", appearance: "المظهر" },
    hi: { ask: "Tive◎AI से कुछ भी पूछें", discovery: "खोज", map: "AI नक्शा", notebook: "नोटबुक", thinking: "सोच रहा हूँ..", history: "वापस", settings: "सेटिंग्स", language: "भाषा", appearance: "दिखावट" }
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
