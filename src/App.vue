<template>
  <router-view />
  <InvisibleFinancePopup ref="popupRef" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import InvisibleFinancePopup from './components/InvisibleFinancePopup.vue';

const popupRef = ref(null);
const hasTriggered = ref(false);
let pollInterval = null;

const checkConsensusStatus = async () => {
    try {
        // Poll the consensus endpoint
        // Using relative path assuming frontend is served from same domain or proxy setup
        // If dev server (Vite) proxies to backend port 3000, this works. 
        // Otherwise might need full URL if not proxied. assuming standard setup.
        const res = await fetch('http://localhost:3000/consensus/status');
        if (res.ok) {
            const data = await res.json();
            if (data.ready && data.want && !hasTriggered.value) {
                // Trigger only once per session to prevent spam
                hasTriggered.value = true;
                popupRef.value?.triggerConsensus();
            }
        }
    } catch (e) {
        console.error('Consensus check failed:', e);
    }
};

onMounted(() => {
    // Check every 2 seconds
    pollInterval = setInterval(checkConsensusStatus, 2000);
    
    // Developer trigger for testing
    window.triggerFinancePopup = () => {
        popupRef.value?.triggerConsensus();
    };
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});
</script>

<style>
/* Global styles are already in style.css */
</style>
