<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: String
});

// Simple markdown-like processing (basic version)
// For production, consider using markdown-it library
const processedContent = computed(() => {
  if (!props.content) return '';
  
  // Basic processing: preserve line breaks and simple formatting
  let html = String(props.content);
  
  // 1. Handle Task Lists (- [ ] or - [x])
  html = html.replace(/- \[ \](.*?)(?=\n|$)/g, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"><span class="text-slate-700">$1</span></div>');
  html = html.replace(/- \[x\](.*?)(?=\n|$)/g, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"><span class="text-slate-500 line-through">$1</span></div>');

  // 2. Handle @Cal and Calendar Date/Time Patterns
  // Detect @Cal specifically - Link to Google Calendar Home
  html = html.replace(/(@Cal|@cal|@Calendar)/g, '<a href="https://calendar.google.com/calendar/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors no-underline" title="Open Google Calendar">$1</a>');
  
  // Detect explicit dates (e.g., 2024-10-27) - Link to create event on that day
  html = html.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (match) => {
      const dateStr = match.replace(/-/g, '');
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${dateStr}/${dateStr}`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="border-b-2 border-indigo-200 text-indigo-700 font-mono cursor-pointer hover:bg-indigo-50 no-underline" title="Create Event on ${match}">${match}</a>`;
  });

  // 3. Handle Markdown Links [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">$1</a>');

  // 4. Handle bare URLs (http://...) that aren't inside markdown links
  html = html.replace(/(?<!href=")(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">$1</a>');

  // 5. Basic Formatting
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')               // Italic
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200">$1</code>')  // Inline code
    .replace(/\n/g, '<br/>');  // Line breaks

  return html;
});
</script>

<template>
  <div class="prose prose-sm max-w-none prose-neutral dark:prose-invert break-words">
    <div v-html="processedContent" />
  </div>
</template>

<style scoped>
/* Markdown-like styling */
:deep(strong) {
  font-weight: 700;
}

:deep(em) {
  font-style: italic;
}

:deep(code) {
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
}

:deep(a) {
  color: #1e293b;
  text-decoration: underline;
  text-decoration-color: #94a3b8;
  text-underline-offset: 2px;
  transition: all 0.2s;
}

:deep(a:hover) {
  text-decoration-color: #0f172a;
}

:deep(ul), :deep(ol) {
  padding-left: 1rem;
  margin: 0.5rem 0;
}

:deep(p) {
  margin-bottom: 0.5rem;
}

:deep(p:last-child) {
  margin-bottom: 0;
}
</style>
