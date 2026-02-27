<script setup>
import { ref } from 'vue';
import { Share2, Book, Check, PenTool, X, Trash2, ArrowLeft, Plus, Mic, Square, Menu, LayoutDashboard } from 'lucide-vue-next';
import { i18n, theme } from '../services/i18n';

const props = defineProps({
    content: { type: String, default: "" },
    isThinking: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'save', 'oke']);

const isSigning = ref(false);

const handleCopy = () => {
    navigator.clipboard.writeText(props.content);
};
</script>

<template>
  <div :class="['fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden font-sans transition-colors duration-700', theme === 'light' ? 'bg-zinc-50 light-mode' : 'bg-black']">
    
    <!-- Top Nav -->
    <header class="absolute top-0 w-full p-10 flex justify-between items-center z-[110]">
        <div class="flex items-center gap-4 opacity-30">
            <Menu :size="20" />
            <span class="text-[10px] font-black uppercase tracking-[0.3em] font-sans">Tive◎AI</span>
        </div>
        <div class="flex items-center gap-4 opacity-30">
            <LayoutDashboard :size="20" class="cursor-pointer hover:opacity-100 transition-opacity" @click="$emit('close')" />
        </div>
    </header>

    <!-- Main Card -->
    <div class="relative w-full max-w-[450px] aspect-square animate-in fade-in zoom-in duration-700">
        <div class="main-card w-full h-full bg-white rounded-[4rem] shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center text-center p-12">
            
            <div v-if="isThinking" class="mb-6 relative">
                <div class="absolute inset-0 bg-[#FF007F] blur-xl opacity-40 animate-pulse scale-150"></div>
                <div class="relative w-3.5 h-3.5 bg-[#FF007F] rounded-full shadow-[0_0_30px_#FF007F]">
                    <div class="absolute inset-[3px] bg-white rounded-full opacity-60"></div>
                </div>
            </div>

            <div class="space-y-6">
                <h2 v-if="isThinking" class="text-3xl font-light tracking-[0.1em] text-black/40">
                    {{ i18n.t('thinking') }}
                </h2>
                <div v-else class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div class="text-2xl sm:text-3xl font-light tracking-tight leading-relaxed text-black/90 max-h-[250px] overflow-y-auto px-4 custom-scrollbar">
                        {{ content }}
                    </div>
                </div>
            </div>
            
            <canvas v-show="isSigning" class="absolute inset-0 z-20 cursor-crosshair rounded-[3.5rem]"></canvas>
        </div>

        <div v-if="!isThinking" class="absolute -top-4 -right-4 flex flex-col gap-2 z-[120]">
             <button @click="isSigning = !isSigning" :class="['w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl', isSigning ? 'bg-red-500 text-white' : 'bg-white text-black border border-black/5']">
                <PenTool :size="18" />
             </button>
        </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="absolute bottom-12 w-full max-w-2xl px-8 flex flex-col items-center gap-8">
        
        <div v-if="!isThinking" class="flex items-center gap-6 animate-in fade-in zoom-in duration-500">
            <button @click="handleCopy" class="w-16 h-16 rounded-3xl bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                <Share2 :size="22" />
            </button>
            <button @click="$emit('oke')" class="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                <Check :size="28" stroke-width="3" />
            </button>
            <button @click="$emit('save')" class="w-48 h-16 rounded-3xl bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all">
                {{ i18n.t('notebook') }}
            </button>
        </div>

        <div class="w-full relative flex items-center bg-white/5 border border-white/10 rounded-full px-6 py-4 shadow-2xl backdrop-blur-md">
            <button class="opacity-30 hover:opacity-100 transition-opacity mr-4">
                <Plus :size="20" />
            </button>
            <input 
                type="text" 
                :placeholder="i18n.t('ask')"
                class="flex-1 bg-transparent text-white text-sm outline-none placeholder:opacity-20"
            />
            <div class="flex items-center gap-4 ml-4">
                <Mic :size="20" class="opacity-30" />
                <div @click="$emit('close')" class="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Square :size="10" fill="black" class="text-black" />
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 2px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }

.main-card {
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.light-mode .ティブ-header, .light-mode header { color: black; }
.light-mode input { color: black; }
.light-mode .placeholder\:opacity-20::placeholder { color: black; opacity: 0.3; }
</style>
