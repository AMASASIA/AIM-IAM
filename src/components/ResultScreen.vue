<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Share2, Book, Check, PenTool, X, Trash2, ArrowLeft } from 'lucide-vue-next';
import { i18n } from '../services/i18n';
import AmanoOrb from './AmanoOrb.vue';

const props = defineProps({
    content: { type: String, default: "Thinking.." },
    isThinking: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'save', 'oke']);

const isSigning = ref(false);
const showOrb = ref(false);
const longPressTimer = ref(null);
const canvasRef = ref(null);
let ctx = null;

const startLongPress = () => {
    longPressTimer.value = setTimeout(() => {
        showOrb.value = true;
    }, 3000);
};

const cancelLongPress = () => {
    clearTimeout(longPressTimer.value);
};

const handleSign = () => {
    isSigning.value = !isSigning.value;
};

const handleCopy = () => {
    navigator.clipboard.writeText(props.content);
    alert('Copied to clipboard');
};

const handleOKE = () => {
    emit('oke');
};
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-white dark:bg-black transition-colors duration-1000 flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden">
    
    <!-- Top Nav -->
    <header class="absolute top-10 w-full px-10 flex justify-between items-center z-[110]">
        <button @click="$emit('close')" class="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft :size="20" />
            <span class="text-[10px] font-black uppercase tracking-widest">{{ i18n.t('history') }}</span>
        </button>
        <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-current rounded-full"></div>
            <span class="text-[10px] font-black uppercase tracking-[0.3em]">Tive◎AI</span>
        </div>
    </header>

    <!-- Main Card -->
    <div 
        class="card-container relative group"
        @mousedown="startLongPress" @touchstart="startLongPress"
        @mouseup="cancelLongPress" @touchend="cancelLongPress"
    >
        <div class="absolute -inset-20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent blur-[120px] -z-10 animate-pulse"></div>

        <div class="main-card relative bg-white/5 dark:bg-white/[0.02] backdrop-blur-3xl border border-white/10 dark:md:p-20 p-10 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center">
            
            <div v-if="!showOrb" class="space-y-8">
                <p class="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 dark:text-white/20">Amano Resonance</p>
                <h2 class="text-3xl sm:text-5xl font-extralight tracking-tighter leading-tight italic dark:text-white/90 text-black/90">
                    {{ isThinking ? i18n.t('thinking') : content }}
                </h2>
            </div>

            <!-- Internal Orb (on Long Press) -->
            <div v-if="showOrb" class="animate-in zoom-in duration-500">
                <AmanoOrb :isListening="false" :isProcessing="true" />
                <button @click="showOrb = false" class="absolute top-10 right-10 opacity-40 hover:opacity-100"><X /></button>
            </div>

            <!-- Signature Layer -->
            <canvas v-show="isSigning" ref="canvasRef" class="absolute inset-0 z-20 cursor-crosshair"></canvas>
        </div>

        <!-- Float Actions (Card Top-Right) -->
        <div class="absolute -top-4 -right-4 flex flex-col gap-2 z-[120]">
             <button @click="handleSign" :class="['w-12 h-12 rounded-full flex items-center justify-center transition-all', isSigning ? 'bg-red-500 text-white' : 'bg-white/10 backdrop-blur-3xl border border-white/20']">
                <PenTool :size="18" />
             </button>
        </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-16 flex flex-col items-center gap-10 z-[110] w-full max-w-md">
        
        <div class="flex items-center gap-4 -space-x-3">
            <button @click="handleCopy" class="action-btn bg-indigo-500/10 text-indigo-500 border-indigo-500/20 active:scale-95">
                <Share2 :size="20" />
            </button>
            <button @click="handleOKE" class="action-btn bg-emerald-500/20 text-emerald-500 border-emerald-500/30 active:scale-95">
                <Check :size="22" stroke-width="3" />
            </button>
        </div>

        <button @click="$emit('save')" class="w-full py-5 rounded-[2.5rem] bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] transition-transform">
            {{ i18n.t('notebook') }}
        </button>

        <!-- Dynamic Input Bar -->
        <div class="w-full relative mt-4">
             <input 
                type="text" 
                :placeholder="i18n.t('ask')"
                class="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2rem] px-8 py-5 text-sm focus:ring-1 focus:ring-current outline-none"
             />
        </div>
    </div>

  </div>
</template>

<style scoped>
.main-card {
    width: 100%;
    max-width: 500px;
    min-height: 500px;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.action-btn {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-5px) scale(1.1);
}

.card-container:active {
    transform: scale(0.98);
}
</style>
