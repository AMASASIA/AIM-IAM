<script setup>
import { ShieldCheck, Share2, ExternalLink, Cpu } from 'lucide-vue-next';

const props = defineProps({
  facts: {
    type: Object,
    required: true
  },
  cid: String,
  amaneLink: String,
  timestamp: String
});
</script>

<template>
  <div class="oke-card group animate-fade-in relative overflow-hidden bg-[#0a0a0a] text-[#e5e5e5]">
    <!-- Ambient Gold Glow -->
    <div class="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none"></div>
    
    <!-- Gold Border Ring -->
    <div class="absolute inset-0 rounded-[32px] border border-amber-500/20 group-hover:border-amber-500/50 transition-colors duration-500 pointer-events-none z-20"></div>

    <!-- Main Content Container -->
    <div class="relative z-10 flex flex-col h-full">
      
      <!-- Top Image / Asset Preview Area (Abstract or Actual) -->
      <div class="relative h-48 rounded-2xl bg-gradient-to-b from-gray-900 to-black overflow-hidden mb-6 border border-white/5 shadow-inner">
        <div class="absolute inset-0 flex items-center justify-center opacity-30">
             <Cpu :size="80" class="text-white animate-pulse-slow" />
        </div>
        <!-- Voice Input Hint (Visual from design) -->
        <div class="absolute top-4 right-4 w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center bg-black/40 backdrop-blur-md">
             <div class="w-1 h-3 bg-amber-500 rounded-full animate-voice-bar"></div>
        </div>
      </div>

      <!-- Header Info -->
      <div class="mb-6">
        <h2 class="font-serif-luxury text-3xl text-amber-100 mb-2 leading-tight">{{ facts.model_id || 'OKE Card' }}</h2>
        <p class="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[90%]">
          A Chrome 139 NFT and SBT demo card featuring on-device voice input.
        </p>
      </div>

      <!-- Token Bound Account Section -->
      <div class="bg-white/5 rounded-2xl p-5 mb-6 border border-white/5">
        <p class="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">Token Bound Account</p>
        <p class="font-mono text-sm text-gray-300 mb-4 tracking-wider truncate">{{ cid || '0x11...67DD' }}</p>
        
        <div class="flex items-center justify-between">
           <div>
               <p class="text-[10px] text-gray-400 mb-1">Soul Points</p>
               <div class="flex items-baseline gap-1">
                 <span class="text-Amber-500 font-serif-luxury text-xl text-amber-500">π</span>
                 <span class="text-2xl font-bold text-white tracking-tight">142.8</span>
                 <span class="text-sm text-gray-600">/ 500</span>
               </div>
           </div>
           
           <!-- Badges -->
           <div class="flex flex-col gap-2 items-end">
             <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
               <ShieldCheck :size="10" class="text-amber-500" />
               <span class="text-[9px] text-gray-300 uppercase tracking-widest font-bold">Verified</span>
             </div>
             <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span class="text-[9px] text-gray-300 uppercase tracking-widest font-bold">VIP Owner</span>
             </div>
           </div>
        </div>
        
        <!-- Plurality Bar (Mini) -->
        <div class="mt-4 pt-4 border-t border-white/5 flex gap-1 h-1">
             <div class="bg-amber-500 h-full rounded-full" style="width: 70%"></div>
             <div class="bg-indigo-500 h-full rounded-full" style="width: 30%"></div>
        </div>
      </div>

      <!-- Actions (Mint/Interaction) -->
      <div class="mt-auto flex justify-center">
        <button class="group/btn relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-black border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:scale-105 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div class="absolute inset-0 rounded-full bg-amber-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <ExternalLink :size="20" class="text-gray-400 group-hover/btn:text-amber-400 transition-colors" />
        </button>
        <div class="absolute bottom-4 text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold pointer-events-none">Mint Now</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.oke-card {
  width: 100%;
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
  font-family: 'Inter', sans-serif; /* Fallback */
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
</style>
