<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { History, Settings, Compass, Map, MessageSquare, Play, Sun, Moon, Globe } from 'lucide-vue-next';
import AmanoOrb from './AmanoOrb.vue';
import ResultScreen from './ResultScreen.vue';
import { i18n, theme, toggleTheme } from '../services/i18n';

const props = defineProps({
  user: Object,
  isListening: Boolean,
  lastAudioUrl: String
});

const emit = defineEmits(['toggleVoice', 'viewDiscovery', 'viewAiMap', 'viewMemos', 'textInput']);

const textInputValue = ref('');
const isResultOpen = ref(false);
const showSettings = ref(false);
const recordingTime = ref(0);
let timerInterval = null;

const handleOrbClick = () => {
    emit('toggleVoice');
};

const handleTextSubmit = () => {
    if (!textInputValue.value) return;
    
    // Command Logic
    if (textInputValue.value.toLowerCase().includes('@amas')) {
        isResultOpen.value = true;
    } else {
        emit('textInput', textInputValue.value);
    }
    textInputValue.value = '';
};

// Key Shortcut (Ctrl+A)
const handleGlobalKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        isResultOpen.value = true;
    }
};

watch(() => props.isListening, (newVal) => {
    if (newVal) {
        recordingTime.value = 0;
        timerInterval = setInterval(() => {
            recordingTime.value++;
            if (recordingTime.value >= 60) emit('toggleVoice'); 
        }, 1000);
    } else {
        clearInterval(timerInterval);
        // "Fluffy" Transition Delay
        if (recordingTime.value > 0) {
            setTimeout(() => { isResultOpen.value = true; }, 1500);
        }
    }
});

const handleOKE = () => {
    isResultOpen.value = false;
    emit('viewMemos'); // Transition to 3rd Page (Notebook)
};

onMounted(() => {
    window.addEventListener('keydown', handleGlobalKey);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKey);
});
</script>

<template>
  <div class="tive-root" :class="{ 'light-mode': theme === 'light' }">
    
    <!-- Result Screen Overlay (Slide In) -->
    <Transition 
        enter-active-class="transform transition duration-1000 ease-out" 
        enter-from-class="translate-y-full opacity-0 scale-95" 
        enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transform transition duration-700 ease-in"
        leave-from-class="translate-y-0 opacity-100 scale-100"
        leave-to-class="translate-y-full opacity-0 scale-95"
    >
        <ResultScreen v-if="isResultOpen" @close="isResultOpen = false" @oke="handleOKE" />
    </Transition>

    <!-- Header: Optimized Positioning -->
    <header class="tive-header">
      <!-- Removed Logo as requested -->
      <div class="brand-placeholder"></div>
      
      <div class="nav-icons">
        <button class="icon-btn" @click="toggleTheme" title="Toggle Theme">
            <component :is="theme === 'dark' ? Sun : Moon" :size="18" />
        </button>
        <button class="icon-btn" @click="showSettings = !showSettings" title="Settings">
            <Settings :size="18" />
        </button>
      </div>
    </header>

    <!-- Floating Settings Menu -->
    <Transition name="pop">
        <div v-if="showSettings" class="settings-card backdrop-blur-3xl shadow-2xl border border-white/10 p-6 rounded-3xl z-[120]">
            <div class="space-y-6">
                <div>
                    <p class="text-[10px] uppercase tracking-widest opacity-40 mb-3">{{ i18n.t('language') }}</p>
                    <div class="grid grid-cols-4 gap-2">
                        <button v-for="l in ['en', 'ja', 'es', 'fr', 'de', 'zh', 'ko', 'it', 'pt', 'ru', 'ar', 'hi']" :key="l" @click="i18n.setLocale(l)" :class="['px-2 py-1.5 rounded-lg text-[8px] uppercase font-bold transition-all', i18n.locale === l ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10']">
                            {{ l === 'ko' ? 'KR' : l }}
                        </button>
                    </div>
                </div>

                <div>
                    <p class="text-[10px] uppercase tracking-widest opacity-40 mb-3">{{ i18n.t('appearance') }}</p>
                    <div class="flex gap-2">
                        <button @click="toggleTheme" class="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 transition-all">
                            <component :is="theme === 'dark' ? Sun : Moon" :size="14" />
                            <span class="text-[9px] uppercase font-bold">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <button @click="showSettings = false" class="absolute top-4 right-4 opacity-40"><X :size="16" /></button>
        </div>
    </Transition>

    <!-- Main Content -->
    <main class="tive-main">
        <div class="hero-section">
           <h1 class="title">Ask Me Anythings</h1>
           <p class="subtitle">{{ i18n.t('ask') }}</p>
        </div>

        <div class="orb-wrapper" @click="handleOrbClick">
          <AmanoOrb :isListening="isListening" :isProcessing="isProcessing" />
          <div v-if="isListening" class="duration-counter">{{ recordingTime }}s</div>
        </div>

        <nav class="bridge-nav">
            <button @click="$emit('viewDiscovery')" class="bridge-link">
                <Compass :size="14" />
                <span>{{ i18n.t('discovery') }}</span>
            </button>
            <button @click="$emit('viewAiMap')" class="bridge-link">
                <Map :size="14" />
                <span>{{ i18n.t('map') }}</span>
            </button>
            <button @click="$emit('viewMemos')" class="bridge-link">
                <Book :size="14" />
                <span>{{ i18n.t('notebook') }}</span>
            </button>
        </nav>
    </main>

                  <footer class="input-container">
                    <div class="input-bar shadow-2xl">
                         <input 
                            v-model="textInputValue"
                            @keydown.enter="handleTextSubmit"
                            type="text" 
                            :placeholder="i18n.t('ask')"
                         />
                         <button @click="handleTextSubmit" class="send-btn">
                            <Play :size="16" fill="white" class="translate-x-0.5" />
                         </button>
                    </div>
                  </footer>

    <div class="ambient-glow"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;900&display=swap');

/* Unified Tive AI Styles */
.tive-root {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 40px; background-color: #000; color: #fff;
  font-family: 'Inter', sans-serif; overflow: hidden; position: relative;
  transition: all 1s ease;
}
.light-mode.tive-root { background-color: #fff; color: #000; }

.tive-header { width: 100%; display: flex; justify-content: space-between; align-items: center; z-index: 50; padding: 10px 0; }
.brand-placeholder { width: 40px; }

.nav-icons { display: flex; gap: 24px; opacity: 0.4; transition: opacity 0.3s; }
.nav-icons:hover { opacity: 1; }

.icon-btn { background: none; border: none; color: inherit; cursor: pointer; }

.tive-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 800px; text-align: center; z-index: 50; }
.hero-section { margin-bottom: 40px; }
.title { font-size: clamp(32px, 8vw, 72px); font-weight: 500; letter-spacing: -0.02em; margin-bottom: 16px; line-height: 1.1; }
.subtitle { font-size: 14px; font-weight: 300; opacity: 0.4; letter-spacing: 0.05em; }

.orb-wrapper { position: relative; cursor: pointer; transition: transform 0.3s ease; }
.orb-wrapper:hover { transform: scale(1.02); }
.duration-counter { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 200; opacity: 0.6; pointer-events: none; }

.bridge-nav { margin-top: 60px; display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; }
.bridge-link { display: flex; align-items: center; gap: 8px; background: none; border: none; color: inherit; opacity: 0.3; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; cursor: pointer; transition: all 0.3s; }
.bridge-link:hover { opacity: 1; transform: translateY(-2px); }

.tive-footer { width: 100%; display: flex; flex-direction: column; align-items: center; z-index: 50; margin-top: auto; }
.input-container { width: 100%; max-width: 500px; margin-bottom: 24px; }
.input-bar { position: relative; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 2.5rem; display: flex; align-items: center; overflow: hidden; padding: 2px; }
.light-mode .input-bar { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); }
.input-bar input { flex: 1; background: transparent; border: none; outline: none; padding: 18px 24px; color: inherit; font-size: 14px; }
.send-btn { width: 48px; height: 48px; background: #6366f1; color: white; border-radius: 50%; display: flex; items: center; justify-content: center; margin-right: 4px; transition: transform 0.2s; }
.send-btn:hover { transform: scale(1.05); }

.settings-card { position: absolute; top: 80px; right: 40px; width: 220px; background: rgba(0,0,0,0.8); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.1); }
.light-mode .settings-card { background: rgba(255,255,255,0.9); border-color: rgba(0,0,0,0.1); }

.ambient-glow { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(128,128,128,0.02) 0%, transparent 80%); pointer-events: none; z-index: 1; }

/* Animations */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.pop-enter-active { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { animation: popIn 0.3s reverse ease-in; }

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
