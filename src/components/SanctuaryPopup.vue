<script setup>
import { ref, onMounted } from 'vue';
import { X, Heart, Shield, Loader, Activity } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  mode: { type: String, default: 'confirm' } // 'confirm' or 'processing'
});

const emit = defineEmits(['close', 'confirm']);

// Sound synthesis state
const audioCtx = ref(null);
const oscillator = ref(null);
const gainNode = ref(null);
const isSanctuaryActive = ref(false);

const playBell = async () => {
    try {
        if (!audioCtx.value) {
            audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Ensure context is running (fixes autoplay policy issues)
        if (audioCtx.value.state === 'suspended') {
            await audioCtx.value.resume();
        }
        
        const now = audioCtx.value.currentTime;
        
        // E7 (2637.02 Hz) - High pure tone for clarity
        oscillator.value = audioCtx.value.createOscillator();
        oscillator.value.type = 'sine';
        oscillator.value.frequency.setValueAtTime(2637.02, now);
        
        // Envelope: Attack (fast) -> Decay (exponential)
        gainNode.value = audioCtx.value.createGain();
        gainNode.value.gain.setValueAtTime(0, now);
        gainNode.value.gain.linearRampToValueAtTime(0.3, now + 0.05); // Gentle attack
        gainNode.value.gain.exponentialRampToValueAtTime(0.001, now + 2.8); // Long tail
        
        oscillator.value.connect(gainNode.value);
        gainNode.value.connect(audioCtx.value.destination);
        
        oscillator.value.start(now);
        oscillator.value.stop(now + 3.0);
        
    } catch (e) {
        console.error("Audio Context Error", e);
    }
};

onMounted(() => {
    // Watch for the prop becoming true to trigger sound
    if (props.show) {
        playBell();
    }
});

// Watch logic would be needed if this component stays mounted but toggles visibility
// For now, assuming v-if controls it from parent or we add watcher.
import { watch } from 'vue';
watch(() => props.show, (newVal) => {
    if (newVal) playBell();
});

const handleYes = () => {
    // 1. Visual Feedback
    isSanctuaryActive.value = true;
    
    // 2. Play Haptic (if mobile)
    if (navigator.vibrate) navigator.vibrate(50);
    
    // 3. Emit decision after short delay for '90s hold' simulation or immediate
    // We emit immediately for the UI flow, parent handles the 'hold'
    setTimeout(() => {
        emit('confirm');
        isSanctuaryActive.value = false;
    }, 1500); // 1.5s visual hold in UI
};

</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center font-sans">
      
      <!-- Backdrop: Heavy Blur + Slight Dim -->
      <div class="absolute inset-0 bg-white/10 backdrop-blur-[32px] transition-all duration-700"></div>

      <!-- Main Sanctuary Card -->
      <div class="relative z-10 w-full max-w-sm p-8 flex flex-col items-center justify-center space-y-12 animate-float-in">
          
          <!-- Status Text -->
          <div class="space-y-2 text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  <span v-if="!isSanctuaryActive">Sanctuary Request</span>
                  <span v-else>Harmonizing...</span>
              </p>
              <h2 class="font-serif-luxury text-2xl italic text-slate-800">
                  {{ isSanctuaryActive ? 'Just a moment.' : 'Proceed with Agreement?' }}
              </h2>
          </div>

          <!-- The Heart / Decision Button -->
          <button 
            @click="handleYes"
            :disabled="isSanctuaryActive"
            :class="['w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 relative group', isSanctuaryActive ? 'scale-90 bg-slate-100 shadow-inner' : 'bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95']"
          >
              <!-- Ripple Effect -->
              <div v-if="!isSanctuaryActive" class="absolute inset-0 rounded-full border border-slate-200 animate-ping opacity-20"></div>
              
              <Activity v-if="isSanctuaryActive" :size="32" class="text-teal-500 animate-pulse" />
              <Heart v-else :size="32" class="text-slate-800 fill-slate-50 group-hover:fill-red-500/10 group-hover:text-red-500 transition-colors" />
          </button>

          <!-- Actions -->
          <div class="flex flex-col gap-4 w-full items-center">
              <button 
                  v-if="!isSanctuaryActive"
                  @click="$emit('close')"
                  class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                  Not Now
              </button>
          </div>
          
      </div>

    </div>
  </Transition>
</template>

<style scoped>
.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
  font-weight: 700;
}

@keyframes float-in {
    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-float-in {
    animation: float-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
