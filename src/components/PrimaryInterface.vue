<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { History, Settings, Compass, Map, MessageSquare, Play } from 'lucide-vue-next';
import AmanoOrb from './AmanoOrb.vue';

const props = defineProps({
  user: Object,
  isListening: Boolean,
  lastAudioUrl: String
});

const emit = defineEmits(['toggleVoice', 'viewDiscovery', 'viewAiMap', 'viewMemos', 'textInput']);

const shimmerRef = ref(null);
const recordingTime = ref(0);
let timerInterval = null;

// Handle Orbit Resonance (Voice Toggle)
const handleOrbClick = () => {
    emit('toggleVoice');
};

// 60-second Limit UI logic
watch(() => props.isListening, (newVal) => {
    if (newVal) {
        recordingTime.value = 0;
        timerInterval = setInterval(() => {
            recordingTime.value++;
            if (recordingTime.value >= 60) {
                emit('toggleVoice'); 
            }
        }, 1000);
    } else {
        clearInterval(timerInterval);
    }
});

const playRaw = () => {
    if (props.lastAudioUrl) {
        const audio = new Audio(props.lastAudioUrl);
        audio.play().catch(e => console.warn("Audio Resonance failed:", e));
    }
};

const handleMouseMove = (e) => {
  if (!shimmerRef.value) return;
  const rect = shimmerRef.value.getBoundingClientRect();
  const x = (1 - (e.clientX - rect.left) / rect.width) * 100;
  shimmerRef.value.style.setProperty('--shimmer-x', `${x}%`);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
  <div class="tive-root">
    
    <!-- Header: Minimal Branding -->
    <header class="tive-header">
      <div class="brand">
        <div class="dot shadow-glow"></div>
        <span class="label">Tive AI</span>
      </div>
      
      <div class="nav-icons">
        <button class="icon-btn"><History :size="18" /></button>
        <button class="icon-btn"><Settings :size="18" /></button>
      </div>
    </header>

    <!-- Main Content: The Core Essence -->
    <main class="tive-main">
        
        <div class="hero-section">
           <h1 class="title">Ask Me Anythings</h1>
           <p class="subtitle">
               Tap the Tive to start a communicate. I can discovery the web, find places, or save your Memo and Notebook.
           </p>
        </div>

        <!-- The Central Orb -->
        <div class="orb-wrapper" @click="handleOrbClick">
          <AmanoOrb :isListening="isListening" :isProcessing="false" />
          
          <!-- Recording Duration Overlay -->
          <Transition name="fade">
            <div v-if="isListening" class="duration-counter">
              {{ recordingTime }}s
            </div>
          </Transition>

          <!-- Playback Resonance (Hidden until recorded) -->
          <Transition name="pop">
              <button 
                v-if="lastAudioUrl && !isListening"
                @click.stop="playRaw"
                class="play-btn shadow-glow"
              >
                <Play :size="16" fill="white" />
              </button>
          </Transition>
        </div>

        <!-- AI Bridge Navigation (Background Services) -->
        <nav class="bridge-nav">
            <button @click="$emit('viewDiscovery')" class="bridge-link">
                <Compass :size="14" />
                <span>Discovery</span>
            </button>
            <button @click="$emit('viewAiMap')" class="bridge-link">
                <Map :size="14" />
                <span>AI Map</span>
            </button>
            <button @click="$emit('viewMemos')" class="bridge-link">
                <MessageSquare :size="14" />
                <span>Memos</span>
            </button>
        </nav>
    </main>

    <!-- Footer: Evolution Meta -->
    <footer class="tive-footer">
        <div class="evolution-bar"></div>
        <div class="meta-label">EVOLUTION LEVEL: 0</div>
    </footer>

    <!-- Atmosphere Glow -->
    <div class="ambient-glow"></div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;900&display=swap');

.tive-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
}

.tive-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #fff;
  border-radius: 50%;
}

.label {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  opacity: 0.8;
}

.nav-icons {
  display: flex;
  gap: 24px;
  opacity: 0.4;
}

.nav-icons:hover {
  opacity: 1;
}

.icon-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.tive-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  text-align: center;
  z-index: 50;
}

.hero-section {
  margin-bottom: 60px;
  animation: slideUp 1s ease-out;
}

.title {
  font-size: clamp(40px, 8vw, 80px);
  font-weight: 500;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  line-height: 1.1;
}

.subtitle {
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.orb-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.orb-wrapper:hover {
  transform: scale(1.05);
}

.duration-counter {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.play-btn {
  position: absolute;
  right: -20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 60;
}

.bridge-nav {
  margin-top: 80px;
  display: flex;
  gap: 40px;
}

.bridge-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: color 0.3s ease;
}

.bridge-link:hover {
  color: #fff;
}

.tive-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 50;
}

.evolution-bar {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.meta-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  color: rgba(255, 255, 255, 0.2);
}

.ambient-glow {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

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
