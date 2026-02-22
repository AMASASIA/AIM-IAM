<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Eye, Upload, Fingerprint, Navigation, Keyboard } from 'lucide-vue-next';

const props = defineProps({
  user: Object,
  isListening: Boolean
});

const emit = defineEmits(['toggleVoice', 'import', 'vision', 'textInput']);
const fileInputRef = ref(null);
const shimmerRef = ref(null);
const showTextInput = ref(false);
const textInputValue = ref('');

const handleImportClick = () => {
  fileInputRef.value?.click();
};

const handleTextSubmit = () => {
    if (!textInputValue.value.trim()) return;
    emit('textInput', textInputValue.value);
    textInputValue.value = '';
    showTextInput.value = false;
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    emit('import', file);
    e.target.value = '';
  }
};

const handleTraceClick = () => {
  window.open('https://aim3-ai-map-bright-luxury-608065432512.us-west1.run.app/', '_blank');
};

const handleMouseMove = (e) => {
  if (!shimmerRef.value) return;
  const rect = shimmerRef.value.getBoundingClientRect();
  // Reverse the ratio so light follows correctly
  const x = (1 - (e.clientX - rect.left) / rect.width) * 100;
  shimmerRef.value.style.setProperty('--shimmer-x', `${x}%`);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center p-10 relative overflow-hidden bg-[#E5E5E5]">
    <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileChange" />
    
    <!-- Top Horizontal Header -->
    <div class="absolute top-32 md:top-40 text-center pointer-events-none select-none">
      <p class="text-[11px] font-black uppercase tracking-[0.8em] text-black/20 mb-8 md:mb-12">SECTOR IDENTIFIER</p>
      <h1 class="text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-4 text-[#1A1A1A]">Primal Interface</h1>
    </div>

    <!-- Center Voice Input -->
    <div class="relative z-50 flex flex-col items-center mt-20">
        <div class="relative mb-12">
          <div v-if="isListening" class="absolute inset-0 rounded-full border border-black/10 animate-ring-expand" />
          <div v-if="isListening" class="absolute inset-0 rounded-full border border-black/5 animate-ring-expand" style="animation-delay: 0.5s" />
          
          <button 
            @click="$emit('toggleVoice')" 
            :class="[
              'relative w-40 h-40 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center transition-all duration-700 shadow-2xl',
              isListening ? 'scale-110 shadow-[0_0_100px_rgba(0,0,0,0.3)]' : 'aura-breathe hover:scale-105 active:scale-95'
            ]"
          >
            <div class="flex items-end gap-1.5 h-12">
               <div v-for="(h, i) in [1, 2, 3, 2, 1]" :key="i" :class="['w-1.5 bg-white rounded-full transition-all duration-300', isListening ? 'animate-voice-bar' : '']" :style="{ height: `${h * 10}px`, animationDelay: `${i * 100}ms`, animationDuration: '0.5s' }" />
            </div>
          </button>
        </div>

        <div class="text-center space-y-4">
           <p class="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Voice Input</p>
           <h3 
             ref="shimmerRef"
             class="font-serif-luxury text-[26px] md:text-[32px] italic leading-tight tracking-tight px-6 interactive-shimmer"
           >
             "Instantly moves to your Notebook"
           </h3>
        </div>
    </div>

    <!-- Bottom Floating Action Bar -->
    <div class="absolute bottom-16 md:bottom-20 flex items-center gap-8 p-5 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-2xl shadow-black/5 hover:scale-105 transition-transform duration-700">
       
       <!-- Vision -->
       <button @click="$emit('vision')" class="w-16 h-16 flex flex-col items-center justify-center gap-1 bg-[#1A1A1A] text-white rounded-[2rem] hover:scale-110 transition-transform shadow-lg group relative overflow-hidden">
           <Eye :size="20" />
           <span class="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-80">Vision</span>
       </button>

       <div class="w-px h-8 bg-black/10 mx-1"></div>

       <!-- Import -->
       <button @click="handleImportClick" class="w-14 h-14 flex flex-col items-center justify-center gap-1 bg-white/60 border border-black/5 text-black rounded-[1.5rem] hover:bg-black/5 transition-all group">
           <Upload :size="18" class="opacity-40 group-hover:opacity-100 transition-opacity" />
           <span class="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40 group-hover:opacity-100">Import</span>
       </button>

       <!-- Auth -->
       <button class="w-14 h-14 flex flex-col items-center justify-center gap-1 bg-white/60 border border-black/5 text-black rounded-[1.5rem] hover:bg-black/5 transition-all group opacity-30 cursor-not-allowed">
           <Fingerprint :size="18" class="opacity-40" />
           <span class="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40">Auth</span>
       </button>

       <!-- Trace -->
       <button @click="handleTraceClick" class="w-14 h-14 flex flex-col items-center justify-center gap-1 bg-white/60 border border-black/5 text-black rounded-[1.5rem] hover:bg-black/5 transition-all group">
           <Navigation :size="18" class="opacity-40 group-hover:opacity-100 transition-opacity" />
           <span class="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40 group-hover:opacity-100">Trace</span>
       </button>

       <!-- Keyboard Input -->
       <button @click="showTextInput = !showTextInput" class="w-14 h-14 flex flex-col items-center justify-center gap-1 bg-white/60 border border-black/5 text-black rounded-[1.5rem] hover:bg-black/5 transition-all group">
           <Keyboard :size="18" class="opacity-40 group-hover:opacity-100 transition-opacity" />
           <span class="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-40 group-hover:opacity-100">Key</span>
       </button>



    </div>

    <!-- Text Input Overlay -->
    <Transition enter-active-class="transform transition duration-300 ease-out" enter-from-class="translate-y-10 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transform transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-10 opacity-0">
        <div v-if="showTextInput" class="absolute bottom-40 w-full max-w-md px-6 z-50">
            <div class="bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/50 flex gap-2">
                <input 
                    v-model="textInputValue"
                    @keydown.enter="handleTextSubmit"
                    type="text" 
                    placeholder="Type command (e.g. '@Cal Meeting tomorrow')" 
                    class="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium px-4"
                    autofocus
                />
                <button @click="handleTextSubmit" class="p-3 bg-black text-white rounded-full hover:scale-105 transition-transform">
                    <Navigation :size="16" class="rotate-90" />
                </button>
            </div>
        </div>
    </Transition>

    <!-- Metadata Footers -->
    <div class="absolute bottom-10 left-10 text-[10px] font-mono-light font-bold text-black/20 uppercase tracking-[0.3em] space-y-2 hidden md:block">
        <p>Active Mode: Amas_Genesis_v4</p>
        <p>SSM: Resonance : 0.998</p>
        <p>Protocol: Amane_XL</p>
    </div>

    <div class="absolute bottom-10 right-10 text-right space-y-1 hidden md:block">
         <p class="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Sync Status</p>
         <p class="text-[14px] font-black uppercase tracking-[0.1em] text-black/80">Verified</p>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
  font-weight: 700;
}

.interactive-shimmer {
  --shimmer-x: 50%;
  position: relative;
  color: rgba(26, 26, 26, 0.7);
}

.interactive-shimmer::before {
  content: '"Instantly moves to your Notebook"';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at var(--shimmer-x) 50%,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(26, 26, 26, 0) 40%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  pointer-events: none;
  z-index: 1;
}

.aura-breathe {
  animation: aura-pulse 4s ease-in-out infinite;
}

@keyframes aura-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes ring-expand {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes voice-bar {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(2.5); }
}

.animate-voice-bar {
  animation: voice-bar 0.5s infinite;
}

.animate-ring-expand {
  animation: ring-expand 2s infinite;
}
</style>
