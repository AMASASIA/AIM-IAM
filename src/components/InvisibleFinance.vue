<script setup>
import { ref, computed } from 'vue';
import { 
  ShieldCheck, 
  Ticket, 
  History, 
  Fingerprint, 
  Coins, 
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  CreditCard,
  Crown,
  X
} from 'lucide-vue-next';

const props = defineProps({
  intentCount: { type: Number, default: 0 }
});

const emit = defineEmits(['close']);

const activeTab = ref('ledger'); // 'ledger' | 'sbt' | 'tickets' | 'biometrics'
const soulBalance = computed(() => (props.intentCount * 12.5).toFixed(2));
const ticketCount = ref(5);

const currentRank = computed(() => {
    if (props.intentCount >= 100) return 'Amane Elite';
    if (props.intentCount >= 50) return 'Semantic Architect';
    if (props.intentCount >= 10) return 'Resonance Adept';
    return 'Novice Responder';
});

const handlePurchaseTicket = () => {
  // Simulated Stripe Integration
  const confirmAction = window.confirm("Buy 1x Voice Card Ticket for ¥500? (Stripe Simulation)");
  if (confirmAction) {
    alert("Biometric validation required to finalize purchase...");
  }
};

const menuItems = [
  { id: 'ledger', icon: History, label: 'Resonance Ledger' },
  { id: 'sbt', icon: ShieldCheck, label: 'SBT Proof' },
  { id: 'tickets', icon: Ticket, label: 'Ticket System' },
  { id: 'biometrics', icon: Fingerprint, label: 'Biometrics' },
];

const ledgerItems = ref([1, 2, 3, 4].map((i) => ({
  id: i,
  amount: (Math.random() * 2).toFixed(2),
  block: (40212 + i).toLocaleString()
})));
</script>

<template>
  <div class="fixed inset-0 z-[5000] bg-[#050505] text-[#E5E5E5] flex flex-col font-sans overflow-hidden animate-fade-in select-none">
    <!-- Chic Header - Preserving the "Finance" Context -->
    <header class="px-10 py-12 flex justify-between items-center border-b border-white/[0.03] bg-black/80 backdrop-blur-3xl">
      <div class="flex items-center gap-6">
        <button @click="$emit('close')" class="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
          <ChevronRight class="rotate-180" :size="24" />
        </button>
        <div class="space-y-1">
          <h1 class="text-3xl font-serif-luxury italic tracking-tighter text-white/90">Invisible Finance</h1>
          <p class="text-[7px] font-black uppercase tracking-[0.5em] text-[#8b7e74]">Amane Protocol v4.2 Obsidian</p>
        </div>
      </div>
      
      <div class="flex items-center gap-10">
        <div class="text-right">
          <p class="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Resonance Points</p>
          <p class="text-3xl font-mono-light tracking-tighter text-[#c0a080] flex items-center gap-2">
            <Coins :size="16" class="opacity-50" />
            {{ soulBalance }} <span class="text-[10px] opacity-30">RP</span>
          </p>
        </div>
        <div class="space-y-1 text-right">
            <p class="text-[8px] font-black uppercase tracking-widest text-teal-500 mb-1">Verified Intents</p>
            <p class="text-2xl font-mono-light text-white/80">{{ intentCount }}</p>
        </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Navigation - Ultra Minimal Sidebar -->
      <aside class="w-80 border-r border-white/[0.03] p-10 flex flex-col gap-3">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'flex items-center gap-5 p-6 rounded-2xl transition-all duration-500 group',
            activeTab === item.id 
            ? 'bg-white/[0.04] text-white shadow-[0_0_40px_rgba(255,255,255,0.01)]' 
            : 'text-white/20 hover:text-white/50'
          ]"
        >
          <component :is="item.icon" :size="18" :class="activeTab === item.id ? 'text-[#c0a080]' : 'text-white/10 group-hover:text-white/30'" />
          <span class="text-[10px] font-bold uppercase tracking-[0.3em]">{{ item.label }}</span>
          <span v-if="item.id === 'tickets' && ticketCount > 0" class="ml-auto w-5 h-5 rounded-full bg-[#c0a080] text-black text-[9px] font-black flex items-center justify-center">
            {{ ticketCount }}
          </span>
        </button>

        <div class="mt-auto p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.03] space-y-4">
          <div class="flex justify-between items-center">
            <Fingerprint :size="16" class="text-teal-500/50" />
            <span class="text-[7px] font-black uppercase tracking-widest text-white/30">Secure Unit Active</span>
          </div>
          <p class="text-[9px] font-light text-white/20 leading-relaxed italic">
            "Resonance keys are rotationally encrypted via Amane L3."
          </p>
        </div>
      </aside>

      <!-- Dynamic Content Panel -->
      <div class="flex-1 overflow-y-auto custom-scroll p-12 md:p-20 bg-gradient-to-br from-[#050505] to-black">
        
        <div v-if="activeTab === 'ledger'" class="space-y-12 animate-fade-in-up">
          <header class="flex justify-between items-end border-b border-white/[0.05] pb-8">
            <div class="space-y-2">
              <h2 class="text-4xl font-serif-luxury italic text-white/90">Resonance Ledger</h2>
              <p class="text-[9px] font-bold uppercase tracking-widest text-white/20">Immutable Transaction History</p>
            </div>
            <div class="text-right opacity-30">
              <span class="text-[8px] font-mono-light uppercase">Node: did:amane:0x88f2...</span>
            </div>
          </header>

          <div class="space-y-4">
            <div 
              v-for="item in ledgerItems" 
              :key="item.id" 
              class="group flex items-center justify-between p-8 bg-white/[0.01] rounded-3xl border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all cursor-crosshair"
            >
              <div class="flex items-center gap-6">
                <div class="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#8b7e74] border border-white/5">
                  <Zap :size="18" />
                </div>
                <div class="space-y-1">
                  <p class="text-[11px] font-bold uppercase tracking-widest text-white/80">Intent Capture Event</p>
                  <p class="text-[9px] font-light text-white/20 italic">Validated via Attention Gap Mechanism</p>
                </div>
              </div>
              <div class="text-right space-y-1">
                <p class="text-[12px] font-mono-light text-[#c0a080]">+{{ item.amount }} SOL</p>
                <p class="text-[7px] text-white/10 uppercase tracking-[0.3em]">Block #{{ item.block }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'sbt'" class="max-w-2xl space-y-12 animate-fade-in-up">
          <div class="relative group">
            <div class="absolute inset-0 bg-[#c0a080]/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div class="relative p-16 bg-gradient-to-br from-[#0a0a0a] to-black rounded-[4rem] border border-white/[0.05] space-y-10 shadow-2xl">
              <div class="flex justify-between items-start">
                <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                  <ShieldCheck :size="40" class="text-[#c0a080]" />
                </div>
                <span class="text-[9px] font-black text-teal-500/80 uppercase tracking-[0.5em] border border-teal-500/20 px-3 py-1 rounded-full">Verified Identity</span>
              </div>
              
              <div class="space-y-4">
                <h2 class="text-5xl font-serif-luxury italic tracking-tighter text-white">Soul Bound Token</h2>
                <p class="text-[14px] font-light text-white/40 leading-relaxed max-w-lg">
                  Your identity is non-custodial and anchored to the Amane Protocol. 
                  This SBT encapsulates your expertise, resonance history, and behavior credentials.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-8 pt-10 border-t border-white/[0.05]">
                <div class="space-y-2">
                  <p class="text-[8px] font-black uppercase text-white/20 tracking-widest">CDR Coefficient</p>
                  <p class="text-2xl font-mono-light text-white/90">{{ (0.8 + (intentCount * 0.002)).toFixed(4) }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-[8px] font-black uppercase text-white/20 tracking-widest">Amane Rank</p>
                  <p class="text-2xl font-mono-light text-[#c0a080]">{{ currentRank }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'tickets'" class="space-y-12 animate-fade-in-up">
          <header class="space-y-2">
            <h2 class="text-4xl font-serif-luxury italic text-white/90">Voice Card Tickets</h2>
            <p class="text-[9px] font-bold uppercase tracking-widest text-white/20">Expand your resonance potential</p>
          </header>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div class="p-12 bg-white/[0.02] border border-white/[0.05] rounded-[3rem] space-y-10">
              <div class="flex items-center gap-5">
                <Ticket class="text-[#c0a080]" :size="28" />
                <span class="text-[11px] font-black uppercase tracking-widest">Balance</span>
              </div>
              <div class="flex items-baseline gap-4">
                <span class="text-8xl font-mono-light text-white">{{ ticketCount }}</span>
                <span class="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">🎟️ Available</span>
              </div>
              <div class="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                <p class="text-[10px] font-light text-white/40 italic leading-relaxed">
                  Tickets are required to trigger "Voice Card Notifications"—a high-priority resonance alert sent to non-active nodes.
                </p>
              </div>
            </div>

            <div class="p-12 bg-white rounded-[3rem] text-black space-y-10 shadow-2xl">
              <div class="flex justify-between items-start">
                <CreditCard :size="32" />
                <span class="text-[8px] font-black uppercase tracking-widest opacity-30">Secure Payment</span>
              </div>
              <div class="space-y-2">
                <p class="text-4xl font-serif-luxury italic tracking-tighter">Purchase Ticket</p>
                <p class="text-sm opacity-60">¥500 per Resonance Unit</p>
              </div>
              <button 
                @click="handlePurchaseTicket"
                class="w-full py-6 bg-black text-white rounded-2xl flex items-center justify-center gap-4 group hover:scale-[1.02] transition-all"
              >
                <span class="text-[10px] font-bold uppercase tracking-[0.4em]">Initiate Stripe Sync</span>
                <ArrowRight :size="14" class="group-hover:translate-x-2 transition-transform" />
              </button>
              <p class="text-[8px] text-center opacity-30 uppercase tracking-widest">Transactions are finalized via Face ID</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'biometrics'" class="max-w-xl space-y-12 animate-fade-in-up">
          <div class="flex flex-col items-center justify-center space-y-12 py-20 bg-white/[0.01] rounded-[4rem] border border-white/[0.03]">
            <div class="relative group cursor-pointer">
              <div class="absolute inset-0 bg-[#c0a080]/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div class="relative w-32 h-32 rounded-full border-2 border-[#c0a080] flex items-center justify-center bg-black/50 shadow-[inset_0_0_30px_rgba(192,160,128,0.2)]">
                <Fingerprint :size="56" class="text-[#c0a080] animate-pulse" />
              </div>
            </div>
            <div class="text-center space-y-4">
              <h3 class="text-[12px] font-black uppercase tracking-[0.6em] text-white">Anchor Authenticated</h3>
              <p class="text-[10px] font-light text-white/30 italic max-w-xs mx-auto">
                Your unique biometric hash is used to sign all resonance events within the Amane OS.
              </p>
            </div>
            <div class="flex gap-1">
               <div v-for="i in 10" :key="i" class="w-1.5 h-1.5 bg-teal-500/20 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Chic Footer Branding -->
    <footer class="p-10 border-t border-white/[0.03] bg-black/20 flex justify-between items-center text-white/20">
      <p class="text-[8px] font-mono-light uppercase tracking-[0.6em]">Amane Protocol Ledger System</p>
      <p class="text-[8px] font-mono-light uppercase tracking-[0.6em]">V4.2 OBSIDIAN SERIES</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
</style>
