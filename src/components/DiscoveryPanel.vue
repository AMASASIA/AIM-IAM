<script setup>
import { ref, computed } from 'vue';
import { Search, Sparkles, Instagram, Hash, Loader, CheckCircle, AlertCircle } from 'lucide-vue-next';

const emit = defineEmits(['extract-insights', 'close']);

const props = defineProps({
  isProcessing: {
    type: Boolean,
    default: false
  }
});

// User inputs
const targetHandle = ref('');
const keywords = ref(['', '', '', '', '']);
const platform = ref('threads'); // 'threads' or 'instagram'

// Validation
const isValid = computed(() => {
  return targetHandle.value.trim() && keywords.value.filter(k => k.trim()).length >= 3;
});

const addKeyword = () => {
  if (keywords.value.length < 10) {
    keywords.value.push('');
  }
};

const removeKeyword = (index) => {
  if (keywords.value.length > 5) {
    keywords.value.splice(index, 1);
  }
};

const startExtraction = () => {
  const cleanKeywords = keywords.value.filter(k => k.trim());
  emit('extract-insights', {
    platform: platform.value,
    handle: targetHandle.value.trim(),
    keywords: cleanKeywords
  });
};
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white/90 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl max-w-2xl w-full overflow-hidden">
      <!-- Header -->
      <div class="p-8 border-b border-slate-100/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles :size="24" class="text-white" />
            </div>
            <div>
              <h2 class="font-serif-luxury text-2xl italic text-slate-900">AI Discovery</h2>
              <p class="text-xs text-slate-500 uppercase tracking-widest mt-1">Needs Extraction Engine</p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
          >
            <span class="text-slate-600 text-xl">×</span>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-8 space-y-6">
        <!-- Platform Selection -->
        <div class="space-y-3">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Platform</label>
          <div class="flex gap-3">
            <button
              @click="platform = 'threads'"
              :class="['flex-1 px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3',
                       platform === 'threads' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <Instagram :size="20" :class="platform === 'threads' ? 'text-purple-600' : 'text-slate-400'" />
              <span :class="['font-bold text-sm', platform === 'threads' ? 'text-purple-900' : 'text-slate-600']">Threads</span>
            </button>
            <button
              @click="platform = 'instagram'"
              :class="['flex-1 px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3',
                       platform === 'instagram' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <Instagram :size="20" :class="platform === 'instagram' ? 'text-pink-600' : 'text-slate-400'" />
              <span :class="['font-bold text-sm', platform === 'instagram' ? 'text-pink-900' : 'text-slate-600']">Instagram</span>
            </button>
          </div>
        </div>

        <!-- Target Handle -->
        <div class="space-y-3">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Target Handle</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
            <input
              v-model="targetHandle"
              type="text"
              placeholder="username"
              class="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-purple-500 focus:ring-0 transition-all font-mono text-slate-900"
            />
          </div>
        </div>

        <!-- Keywords -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Keywords (Min 3)</label>
            <button
              v-if="keywords.length < 10"
              @click="addKeyword"
              class="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider"
            >
              + Add More
            </button>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(keyword, index) in keywords" 
              :key="index"
              class="flex items-center gap-2"
            >
              <Hash :size="16" class="text-slate-300 flex-shrink-0" />
              <input
                v-model="keywords[index]"
                type="text"
                :placeholder="`Keyword ${index + 1}`"
                class="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-purple-500 focus:ring-0 transition-all text-sm"
              />
              <button
                v-if="keywords.length > 5"
                @click="removeKeyword(index)"
                class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all text-slate-400"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="bg-purple-50/50 border border-purple-100 rounded-2xl p-4">
          <div class="flex gap-3">
            <Sparkles :size="18" class="text-purple-500 flex-shrink-0 mt-0.5" />
            <div class="text-xs text-purple-900 leading-relaxed">
              <p class="font-bold mb-1">AI will analyze:</p>
              <ul class="space-y-1 text-purple-700">
                <li>• Latest posts matching your keywords</li>
                <li>• Hidden needs & desires from content</li>
                <li>• 3 actionable insights for your notebook</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t border-slate-100/50 bg-slate-50/50">
        <button
          @click="startExtraction"
          :disabled="!isValid || isProcessing"
          :class="['w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3',
                   isValid && !isProcessing 
                     ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95' 
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed']"
        >
          <component :is="isProcessing ? Loader : Search" :size="20" :class="isProcessing ? 'animate-spin' : ''" />
          <span>{{ isProcessing ? 'Extracting Insights...' : 'Start AI Discovery' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
}
</style>
