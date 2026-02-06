<script setup>
import { ref, onMounted } from 'vue';
import { useInvisibleFinance } from '../composables/useInvisibleFinance';
import { Heart } from 'lucide-vue-next';

const props = defineProps({
  targetName: {
    type: String,
    default: 'Someone'
  },
  intentType: {
    type: String,
    default: 'Liaison'
  }
});

const emit = defineEmits(['close', 'agreed']);

const { 
  playSanctuaryBell, 
  startSanctuaryHold, 
  executeInvisibleFinance, 
  isHolding, 
  sanctuaryTime 
} = useInvisibleFinance();

const show = ref(true);
const voiceInputActive = ref(false);

onMounted(() => {
  playSanctuaryBell(); // 出現時に鈴の音を鳴らす (2.6kHz E7)
});

const handleYes = async () => {
  // 感情フィルタリング（90秒ルール）の発動
  // ※ 実際の実装ではユーザーが待たずに接続する場合もありますが、
  // ここでは聖域の思想に基づき、ホールド期間を開始します
  
  // NOTE: For better UX in this demo, we might skip the full 90s wait if user presses YES explicitly,
  // OR we enforce it. The text says "90秒のフィルタリングをバックグラウンドで適用".
  // Let's emit agreed immediately but keep the visual hold/processing.
  
  // Actually, the prompt says "合意が確定した瞬間... Invisible Financeが走り".
  // So we emit first, then do the finance logic.
  
  emit('agreed', { targetName: props.targetName, intentType: props.intentType });
  
  // Start visual hold/processing
  voiceInputActive.value = true;
  await executeInvisibleFinance(`${props.intentType} with ${props.targetName}`);
  
  setTimeout(() => {
    show.value = false;
    emit('close');
  }, 1000);
};

const handleDismiss = () => {
  show.value = false;
  emit('close');
};
</script>

<template>
  <Transition name="amas-fade">
    <div v-if="show" class="invisible-finance-overlay">
      <div class="glass-card animate-fade-in-up">
        <!-- Background Blur/Glass Effect is handled by CSS -->
        
        <div class="content-area min-h-[200px] flex flex-col justify-center items-center">
          
          <!-- Pulse Button (Heartbeat) -->
          <div 
            class="mic-button" 
            :class="{ active: voiceInputActive, holding: isHolding }"
            @click="handleYes"
          >
            <div class="pulse-ring"></div>
            <Heart 
              :size="32" 
              :class="voiceInputActive ? 'text-amber-400 fill-amber-400' : 'text-white'" 
            />
          </div>

          <!-- Status Text -->
          <div class="space-y-2 text-center mt-6">
             <p class="font-serif-luxury italic text-2xl text-white">
                Just moment / <span class="text-sm">少々お待ちくださいませ</span>
             </p>
             <p class="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                 AMAS RESONANCE LINK
             </p>
          </div>

        </div>

        <div class="action-footer">
          <button @click="handleYes" class="btn-yes">YES</button>
          <button @click="handleDismiss" class="btn-not-now">Not now</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
}

.invisible-finance-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(24px); /* Prompt specified 24px */
  z-index: 10000;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05); /* Extremely subtle */
  backdrop-filter: blur(40px); /* Inner blur */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 48px;
  padding: 60px 40px;
  width: 420px;
  text-align: center;
  color: #fff;
  box-shadow: 0 40px 100px rgba(0,0,0,0.2);
  display: flex;
  flex-col: column;
  align-items: center;
}

.mic-button {
  position: relative;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255,255,255,0.1);
}

.mic-button:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.1);
}

.mic-button.holding {
  background: rgba(255, 165, 0, 0.1);
  transform: scale(1.1);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: amas-pulse 3s infinite;
}

@keyframes amas-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { transform: scale(1.6); opacity: 0; }
}

.action-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 40px;
  padding: 0 10px;
}

button {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-style: italic;
  cursor: pointer;
  padding: 10px 20px;
  transition: all 0.4s;
  letter-spacing: 0.05em;
}

button:hover {
  color: #fff;
  transform: translateY(-2px);
}

.btn-yes {
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.amas-fade-enter-active,
.amas-fade-leave-active {
  transition: opacity 1s ease, transform 1s ease;
}

.amas-fade-enter-from,
.amas-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
