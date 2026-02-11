<script setup>
import { ref, nextTick } from 'vue';
import { Feather, MapPin, Sparkles, ShieldCheck, Zap, Image as ImageIcon, Clock, BookOpen, Mic, Video, Activity } from 'lucide-vue-next';
import MarkdownRenderer from './MarkdownRenderer.vue';
import OKECertificationCard from './OKECertificationCard.vue';

const props = defineProps({
  user: Object,
  entries: {
    type: Array,
    default: () => []
  },
  filter: {
    type: String,
    default: 'all'
  },
  isListening: Boolean
});

const emit = defineEmits(['save-diary', 'update-filter', 'toggle-voice', 'nav', 'action']);
const diaryInput = ref('');
const showDiaryInput = ref(false);

const localFilter = ref(props.filter);

// Sync prop change to local state
import { watch, computed } from 'vue';
watch(() => props.filter, (newVal) => {
    localFilter.value = newVal;
});

const setFilter = (val) => {
    localFilter.value = val;
    emit('update-filter', val);
};

const filteredEntries = computed(() => {
    if (localFilter.value === 'all') return props.entries;
    return props.entries.filter(e => {
        if (localFilter.value === 'diary') return e.type === 'diary' || e.type === 'visual_diary' || e.type === 'voice_memo' || e.type === 'standard';
        if (localFilter.value === 'memo') return e.type === 'standard' || e.type === 'voice_memo' || e.type === 'scifi' || e.type === 'system'; 
        if (localFilter.value === 'todo') return e.type === 'todo' || e.type === 'calendar' || e.type === 'habit';
        if (localFilter.value === 'features') return e.type === 'resonance' || e.type === 'system' || e.type === 'deployment';
        return true;
    });
});

const toggleDiaryInput = async () => {
  showDiaryInput.value = !showDiaryInput.value;
  if (showDiaryInput.value) {
    await nextTick();
    const inputSection = document.getElementById('diary-input-section');
    inputSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const saveDiaryEntry = () => {
    if (!diaryInput.value.trim()) return;
    emit('save-diary', diaryInput.value);
    diaryInput.value = '';
    showDiaryInput.value = false;
};
</script>

<template>
  <div v-if="user" class="w-full h-full flex flex-col items-center overflow-y-auto custom-scroll bg-white/50 backdrop-blur-sm">
    <div class="w-full max-w-6xl px-6 md:px-12 py-6 md:py-12 space-y-12 md:space-y-20">
      
      <!-- HEADER SECTION -->
      <header class="text-center space-y-6 md:space-y-8 mt-16 md:mt-24">
        <div class="flex flex-col items-center justify-center">
          <div class="flex gap-6">
            <button @click="toggleDiaryInput" class="w-16 h-16 md:w-24 md:h-24 rounded-full bg-slate-900 flex items-center justify-center text-teal-400 shadow-2xl shadow-teal-100/20 hover:scale-110 hover:shadow-teal-500/30 transition-all cursor-pointer group active:scale-95">
              <Feather :size="32" class="group-hover:rotate-12 transition-transform duration-500" />
            </button>
            <button @click="$emit('toggle-voice')" :class="['w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer group active:scale-95 shadow-2xl', isListening ? 'bg-red-500 text-white scale-110 shadow-red-500/50' : 'bg-slate-900 text-purple-400 shadow-purple-100/20 hover:shadow-purple-500/30']">
              <component :is="isListening ? Zap : Mic" :size="32" :class="[isListening ? 'animate-pulse' : 'group-hover:-rotate-12 transition-transform duration-500']" />
            </button>
          </div>
          <p class="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
            <span class="hover:text-teal-500 cursor-pointer transition-colors" @click="toggleDiaryInput">Write</span>
            <span class="mx-2">/</span>
            <span class="hover:text-purple-500 cursor-pointer transition-colors" @click="$emit('toggle-voice')">Speak</span>
          </p>
        </div>
        <h1 class="font-serif-luxury text-7xl md:text-[8rem] lg:text-[10rem] text-slate-900 leading-[0.8] tracking-tighter font-bold italic select-none">Personal Notebook</h1>
        
        <!-- Notebook Navigation Tabs -->
        <div class="flex justify-center gap-4 mt-8">
            <button 
                v-for="tab in [
                    { id: 'all', label: 'All Entries' }, 
                    { id: 'diary', label: 'Diary & Voice' }, 
                    { id: 'todo', label: 'Tasks & Schedule' },
                    { id: 'memo', label: 'Memos' },
                    { id: 'features', label: 'Features' }
                ]" 
                :key="tab.id"
                @click="setFilter(tab.id)"
                :class="['px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all', 
                         localFilter === tab.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-400 hover:bg-slate-100']"
            >
                {{ tab.label }}
            </button>
        </div>

      </header>

      <!-- DIARY INPUT SECTION -->
      <section v-if="showDiaryInput" id="diary-input-section" class="space-y-6 relative z-[50]">
          <div class="bg-white/80 p-8 rounded-3xl shadow-sm border border-slate-100 backdrop-blur-md">
              <h3 class="text-xl font-serif-luxury italic text-slate-900 mb-4 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                      <Sparkles :size="18" class="text-teal-500" />
                      <span>Write in your Diary</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400 tracking-widest">{{ diaryInput.length }} / 300</span>
              </h3>
              <textarea
                  v-model="diaryInput"
                  placeholder="Capture the essence of the moment..."
                  maxlength="300"
                  class="w-full h-32 p-6 rounded-xl border-none bg-[#fdfbf7] text-slate-800 font-serif resize-none transition-all shadow-inner focus:ring-0 text-lg leading-relaxed placeholder:text-slate-300 placeholder:italic"
              ></textarea>
              <div class="flex justify-end mt-4">
                  <button 
                  @click="saveDiaryEntry" 
                  :disabled="!diaryInput.trim()"
                  class="px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                  Save Entry
                  </button>
              </div>
          </div>
      </section>

      <!-- VISUAL DIARY LOG -->
      <section v-if="filteredEntries.length > 0" class="space-y-12">
        <div class="flex items-center gap-6 px-4">
          <div class="h-[1px] flex-1 bg-slate-200/50" />
          <span class="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{{ localFilter === 'all' ? 'Unified Timeline' : localFilter + ' Timeline' }}</span>
          <div class="h-[1px] flex-1 bg-slate-200/50" />
        </div>
        
        <div class="grid grid-cols-1 gap-12">
          <TransitionGroup name="list" tag="div" class="space-y-12">
        <div 
          v-for="entry in filteredEntries" 
          :key="entry.id" 
          class="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:-translate-y-2 relative group"
        >
          <!-- FEATURE BUTTONS OVERLAY FOR FEATURES TAB -->
          <div v-if="localFilter === 'features' && entry.id === filteredEntries[0]?.id" class="w-full p-10 bg-slate-50/50 border-b border-slate-100">
             <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                <button @click="$emit('nav', 'oke')" class="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 hover:border-blue-500 transition-all group/btn shadow-sm hover:shadow-xl">
                    <Activity :size="32" class="text-blue-500 mb-4 group-hover/btn:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">OKE System</span>
                    <span class="font-serif-luxury text-xl italic text-slate-900 mt-2">Certifications</span>
                </button>
                
                <button @click="$emit('action', 'video')" class="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 hover:border-teal-500 transition-all group/btn shadow-sm hover:shadow-xl">
                    <Video :size="32" class="text-teal-500 mb-4 group-hover/btn:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Video Bridge</span>
                    <span class="font-serif-luxury text-xl italic text-slate-900 mt-2">Resonance Call</span>
                </button>
                <button @click="$emit('nav', 'map')" class="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 transition-all group/btn shadow-sm hover:shadow-xl">
                    <MapPin :size="32" class="text-indigo-500 mb-4 group-hover/btn:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Map</span>
                    <span class="font-serif-luxury text-xl italic text-slate-900 mt-2">Geographic Trace</span>
                </button>
                <button @click="$emit('action', 'finance')" class="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 hover:border-emerald-500 transition-all group/btn shadow-sm hover:shadow-xl">
                    <Zap :size="32" class="text-emerald-500 mb-4 group-hover/btn:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fairy Vert</span>
                    <span class="font-serif-luxury text-xl italic text-slate-900 mt-2">Invisible Finance</span>
                </button>
                <button @click="$emit('action', 'recorder')" class="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 hover:border-red-500 transition-all group/btn shadow-sm hover:shadow-xl">
                    <Feather :size="32" class="text-red-500 mb-4 group-hover/btn:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Recorder</span>
                    <span class="font-serif-luxury text-xl italic text-slate-900 mt-2">L0 Archive</span>
                </button>
             </div>
          </div>
              <!-- NEW BADGE FOR VOICE MEMO -->
               <div v-if="entry.type === 'voice_memo' || entry.type === 'standard' && entry.title?.includes('Voice Memo')" class="absolute top-6 right-6 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest z-10 flex items-center gap-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Audio Record
              </div>

              <div v-if="entry.metadata?.image" class="w-full lg:w-2/5 aspect-square lg:aspect-auto bg-slate-50 relative">
                <img 
                  :src="entry.metadata.image" 
                  :alt="entry.title" 
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/5" />
              </div>
              
              <div class="flex-1 p-10 md:p-16 space-y-8 flex flex-col justify-center">
                <div class="flex justify-between items-start">
                  <div class="space-y-4">
                    <!-- Date Header -->
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {{ new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
                        </span>
                        <span v-if="entry.type === 'voice_memo'" class="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold uppercase rounded-full">Voice</span>
                        <span v-else-if="entry.type === 'diary'" class="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase rounded-full">Journal</span>
                        <span v-else-if="entry.type === 'scifi'" class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase rounded-full">Briefing</span>
                        <span v-else-if="entry.type === 'habit'" class="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase rounded-full">Routine</span>
                    </div>
                    
                    <h3 class="font-serif-luxury text-3xl md:text-4xl italic text-slate-900 leading-tight">
                        {{ entry.title }}
                    </h3>
                  </div>
                </div>
                
                <!-- Transcription Block (Special styling for Voice Memos) -->
                <div v-if="entry.metadata?.transcript" class="relative group/hash">
                    <div class="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                        <p class="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-2">Original Voice Transcript</p>
                        <p class="font-serif text-lg md:text-xl text-slate-700 leading-relaxed italic">
                            "{{ entry.metadata.transcript }}"
                        </p>
                    </div>
                    <!-- TRUST HASH -->
                    <div v-if="entry.metadata?.verification_hash" class="absolute -bottom-3 right-4 bg-white px-2 py-1 rounded-full border border-indigo-100 text-[8px] font-mono text-indigo-300 shadow-sm opacity-50 group-hover/hash:opacity-100 transition-opacity whitespace-nowrap">
                        Verified Hash: {{ entry.metadata.verification_hash }}
                    </div>
                </div>

                <!-- Main Content / AI Summary / Diary Text -->
                <div class="prose prose-lg max-w-none text-slate-600 font-serif leading-relaxed">
                  <MarkdownRenderer :content="entry.content || ''" />
                </div>
  
                <!-- OKE Certification Card Integration (Only for certified items) -->
                <div v-if="entry.metadata?.oke_facts" class="mt-8 border-t border-slate-100 pt-8">
                  <OKECertificationCard 
                    :facts="entry.metadata.oke_facts" 
                    :cid="entry.metadata.certification_id"
                    :amaneLink="entry.metadata.amane_link"
                    :timestamp="new Date(entry.timestamp).toLocaleTimeString()"
                  />
                </div>
  
                <!-- Footer (Only for System Logs) -->
                <div v-if="!['voice_memo', 'diary'].includes(entry.type)" class="pt-8 border-t border-slate-50 flex gap-3 opacity-50">
                  <span class="text-[9px] font-bold text-slate-300 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Amane System</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </section>
      
      <!-- EMPTY STATE -->
      <section v-else class="text-center py-20 opacity-30 select-none">
          <BookOpen :size="48" class="mx-auto mb-4 text-slate-300" />
          <p class="font-serif-luxury italic text-2xl">Your canvas is empty.</p>
          <p class="text-[10px] uppercase tracking-widest mt-2">Chat with AI or analyze scenes to capture insights.</p>
      </section>

      <!-- VERIFIED IDENTITY SECTION -->
      <section class="pt-20">
        <div class="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 right-0 p-12 md:p-20 opacity-[0.05] pointer-events-none">
            <ShieldCheck :size="320" />
          </div>
          
          <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24 relative z-10">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <Zap :size="22" class="text-slate-900" />
              </div>
              <h2 class="text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] text-teal-500">Verified Identity Data</h2>
            </div>
            <div class="w-full md:w-auto px-6 py-3 border border-slate-700/50 rounded-2xl bg-slate-800/20">
              <p class="text-[10px] md:text-[11px] font-mono-light text-slate-400 tracking-widest uppercase truncate">DID: {{ user.id.slice(0, 16) }}...</p>
            </div>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
            <div class="space-y-12">
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Anchor</p>
                <p class="text-2xl md:text-4xl font-serif-luxury italic font-semibold">@{{ user.threadsId }} Identity Sphere</p>
              </div>
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SBT Attributes</p>
                <ul class="text-[14px] md:text-[16px] font-light text-slate-400 space-y-4">
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    Synchronized Amane Core
                  </li>
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    Verified Resonance Participant
                  </li>
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    CDR Score: 0.99
                  </li>
                </ul>
              </div>
            </div>

            <div class="space-y-12">
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secret Notebook Abstract</p>
                <p class="text-[14px] md:text-[18px] font-light text-slate-400 leading-relaxed italic border-l-2 border-slate-800 pl-8 font-serif-luxury">
                  "{{ user.secretNotebook }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="text-center pt-20 pb-40 md:pb-60">
        <div class="inline-flex items-center gap-6 opacity-20">
          <div class="w-10 h-[1px] bg-slate-400" />
          <p class="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 whitespace-nowrap">Archive State Synced | Amane Core OS</p>
          <div class="w-10 h-[1px] bg-slate-400" />
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
/* Global styles for dynamic content */
.prose a {
  pointer-events: auto !important;
  cursor: pointer !important;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
