<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, X, LayoutDashboard, MessageSquare, Video, Terminal, Compass, Shield, Fingerprint, Users, Box, Activity, Book } from 'lucide-vue-next';
import AnchorScreen from '../components/AnchorScreen.vue';
import ChatMessaging from '../components/ChatMessaging.vue';
import NotebookView from '../components/NotebookView.vue';
import PrimaryInterface from '../components/PrimaryInterface.vue';
import ContactBook from '../components/ContactBook.vue';
import InvisibleFinancePopup from '../components/InvisibleFinancePopup.vue';
import InvisibleFinance from '../components/InvisibleFinance.vue';
import SanctuaryPopup from '../components/SanctuaryPopup.vue';
import { createKernelSession, generateSecretNotebook, sendMessage, processVoiceNote, analyzeIntent, analyzeSemanticDiff } from '../services/geminiService.js';
// import { processAssetToGateway } from '../services/assetService.js'; // Moved to composable
import NotificationSystem from '../components/NotificationSystem.vue';
import NotificationToast from '../components/NotificationToast.vue';
import { useNotifications } from '../composables/useNotifications';
import OKECertificationCard from '../components/OKECertificationCard.vue';
import AmaneCertificationCard from '../components/AmaneCertificationCard.vue';
import { Map as MapIcon, CreditCard, ShieldCheck, ShoppingBag } from 'lucide-vue-next';
import contactBook from '../services/contactBook.js';
import AmasLiaisonService from '../services/amasLiaisonService.js';
import peerService from '../services/peerService.js';
import VideoOverlay from '../components/VideoOverlay.vue';
import { useAntigravityRecorder } from '../composables/useAntigravityRecorder';
import { useVisionCore } from '../composables/useVisionCore'; // Visual Cortex
import { useAmasSecretary } from '../composables/useAmasSecretary'; // AMAS Secretary
import SystemLogs from '../components/SystemLogs.vue';
import { labelingCaller } from '../services/labelingCaller';

// State
const user = ref(null);
const router = useRouter();
const isSearchingPeer = ref(false);
const showVideoOverlay = ref(false);
const { notify, notifications, removeNotification } = useNotifications();
const showOKEModal = ref(false);
const showInvisibleFinance = ref(false);
const remoteStream = ref(null);
const localStream = ref(null);
const messages = ref([]);
const notebookEntries = ref([]);
const showMobileMenu = ref(false); // Mobile awareness
const isLoading = ref(false);
const isInitializing = ref(false);
const activeView = ref('dashboard');
const isSidebarOpen = ref(false);
const isListening = ref(false);
const kernelSession = ref(null);
const recognitionRef = ref(null);
// Sanctuary State
const showSanctuary = ref(false);

const handleSanctuaryConfirm = () => {
    showSanctuary.value = false;
    notify('AMAS Liaison', 'Agreement Sealed. SBT Minting...', 'success');
    
    // Log the invisible finance event
    notebookEntries.value.unshift({
        id: 'SBT-' + Date.now(),
        type: 'scifi',
        title: '💎 Invisible Finance: Agreement',
        content: '**Protocol Sealed**\n\n- Type: Liaison Integration\n- Status: Minted on Polygon zkEVM\n- Hash: In-Visible',
        timestamp: new Date()
    });
};

// ... existing refs
const showContactBook = ref(false);
const activeCall = ref(null); // { targetName, intentType, contact }
const showFinancePopup = ref(false);
const isSanctuaryActive = ref(false);
const liaisonService = ref(null);
const { startCapture, stopCapture, isRecording } = useAntigravityRecorder();
const notebookFilter = ref('all');

const toggleRecording = async () => {
  if (isRecording.value) {
    stopCapture();
    notify('Antigravity Recorder', 'Recording stopped. Saving to L0...', 'info');
  } else {
    await startCapture();
    if (isRecording.value) {
       notify('Antigravity Recorder', 'Screen recording started.', 'success');
    }
  }
};




  // Load user from localStorage
onMounted(() => {
  const savedUser = localStorage.getItem('amas_user_v4');
  let loadedHistory = [];

  const savedMessages = localStorage.getItem('amas_messages_v4');
  if (savedMessages) {
    const parsed = JSON.parse(savedMessages).map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
    messages.value = parsed;

    // Convert to Gemini format for history
    loadedHistory = parsed.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
  }

  if (savedUser) {
    user.value = JSON.parse(savedUser);
    kernelSession.value = createKernelSession(loadedHistory);
  }
  
  // Notebook Persistence v2 (Migration & Stability)
  const savedNotebookV2 = localStorage.getItem('amas_notebook_v2');
  const savedNotebookV1 = localStorage.getItem('amas_notebook_v1');
  
  if (savedNotebookV2) {
    try {
        notebookEntries.value = JSON.parse(savedNotebookV2).map(e => ({
            ...e,
            timestamp: new Date(e.timestamp)
        }));
        // console.log("Notebook v2 loaded.");
    } catch (e) {
        console.error("Notebook v2 corruption:", e);
    }
  } else if (savedNotebookV1) {
    // Migration from v1
    try {
        const v1Data = JSON.parse(savedNotebookV1).map(e => ({
            ...e,
            timestamp: new Date(e.timestamp)
        }));
        notebookEntries.value = v1Data;
        notify('System', 'Notebook storage upgraded to v2.', 'success');
    } catch (e) {
        console.error("Migration failed.", e);
    }
  }

  // DEV UTILITY: Shift+S to test Sanctuary
  window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'S') {
        console.log('Dev Trigger: Sanctuary');
        showSanctuary.value = true;
    }
  });

  // Initialize Liaison Service [AMAS_GENESIS_REVIVAL]
  liaisonService.value = new AmasLiaisonService({
    onPresenceDetected: () => {
      isSanctuaryActive.value = true;
      // Sanctuary Bell is handled by InvisibleFinancePopup upon actual call
      // or we can manually play some background resonance here
    }
  });
  
  // Setup P2P Message Handler
  peerService.onMessage = (data, peerId) => {
      if (data.type === 'INVISIBLE_FINANCE_REQUEST') {
          handleNotificationRequest(data, peerId);
      } else if (data.type === 'INVISIBLE_FINANCE_RESPONSE') {
          if (data.answer === 'YES') {
               notify('Fairy Vert', `Agreement Confirmed by ${peerId.substr(0,4)}...`, 'success');
               showInvisibleFinance.value = true; 
          } else {
               notify('Fairy Vert', `Request Declined by ${peerId.substr(0,4)}...`, 'warning');
          }
      }
  };
});


  // Unified command processor (Voice or Text)
  const { processVisualImport } = useVisionCore();
  const { handleVoiceNote: processSecretaryNote } = useAmasSecretary();

  /* Refactored Voice Handler for Robustness */
  const handleVoiceTranscription = async (transcript, isText = false) => {
      console.log('Processing Command:', transcript);
      
      // 1. Immediate UI Feedback
      if (activeView.value !== 'notebook') {
           activeView.value = 'notebook';
      }
      notebookFilter.value = 'all'; 
      notify('Amane Core', `Heard: "${transcript}"`, 'info');
      
      const processingId = 'proc-' + Date.now();
      
      // Add visual processing indicator
      if (!isText) {
          notebookEntries.value.unshift({
              id: processingId,
              type: 'voice_memo', 
              title: 'Creating Note...',
              content: 'Analyzing voice patterns...',
              metadata: { is_refined: false },
              timestamp: new Date(),
              isProcessing: true
          });
      }

      try {
        // 2. Intent Analysis (with fallback)
        let intent;
        try {
            intent = await analyzeIntent(transcript);
        } catch (e) {
            console.error("Intent Analysis Failed:", e);
            intent = { intent: 'NOTEBOOK_MEMO', message: transcript };
        }
        
        console.log('Final Intent:', intent);

        // 3. Execute Logic based on Intent
        switch (intent.intent) {
          case 'SCHEDULE_EVENT':
             // Calendar Handling
             await handleScheduleEvent(intent);
             break;
             
          case 'TODO_TASK':
             // Task Handling
             const taskEntry = {
                id: Date.now().toString(),
                type: 'todo',
                title: `✅ Task: ${intent.message}`,
                content: `- [ ] ${intent.message}\n\n*Voice Entry*`,
                timestamp: new Date()
             };
             notebookEntries.value.unshift(taskEntry);
             notify('Tasks', 'Task added.', 'success');
             break;
             
          case 'NAVIGATE':
             handleNavigationIntent(intent);
             break;
             
          case 'NOTEBOOK_MEMO':
          default:
             // 4. Default: Secretary Memo (Robust)
             // Even if this fails, we catch it and save raw transcript
             const secretaryEntry = await processSecretaryNote(transcript);
             notebookEntries.value.unshift(secretaryEntry);
             notify('Notebook', 'Memo saved.', 'success');
             break;
        }
        
        // Ensure we are still on notebook view
        if (activeView.value !== 'notebook') activeView.value = 'notebook';

      } catch (finalError) {
        console.error('Critical Voice Error, saving raw:', finalError);
        // Emergency Fallback: Save raw text
        notebookEntries.value.unshift({
            id: Date.now().toString(),
            type: 'voice_memo',
            title: 'Quick Note (Raw)',
            content: transcript,
            timestamp: new Date(),
            metadata: { error: finalError.message }
        });
        notify('System', 'Saved as raw note due to error.', 'warning');
      } finally {
        // Remove processing placeholder
        notebookEntries.value = notebookEntries.value.filter(e => e.id !== processingId);
      }
  };

  // Helper for Calendar
  const handleScheduleEvent = async (intent) => {
      const title = intent.message || 'New Event';
      // Create simplified calendar entry
      notebookEntries.value.unshift({
          id: Date.now().toString(),
          type: 'calendar',
          title: `📅 ${title}`,
          content: `**Event Scheduled**\n\n- Event: ${title}\n- Time: ${intent.start_time || 'Tomorrow 10:00 AM'}\n\n@Cal Open Calendar`,
          timestamp: new Date()
      });
      notify('Calendar', 'Event drafted.', 'success');
  };

  const handleNavigationIntent = (intent) => {
     if (intent.message.includes('diary')) notebookFilter.value = 'diary';
     else if (intent.message.includes('task')) notebookFilter.value = 'todo';
     else notebookFilter.value = 'all';
     notify('Navigation', `Filter: ${notebookFilter.value}`, 'info');
  };

    // Manual fallback for immediate voice activation
    const forceNotebook = () => {
        activeView.value = 'notebook';
        const stubEntry = {
            id: Date.now().toString(),
            type: 'standard',
            title: 'Manual Entry',
            content: 'Voice input override active.',
            metadata: {
                verification_hash: "0xHASH_" + Date.now().toString(16) + "_MANUAL_OVERRIDE_SIGNED"
            },
            timestamp: new Date()
        };
        notebookEntries.value.unshift(stubEntry);
    };

    // Helper to generate a "Proof of Thought" hash
    const generateTrustHash = (input) => {
        let hash = 0;
        const str = input + Date.now().toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; 
        }
        return '0x' + Math.abs(hash).toString(16).padStart(64, '0').substring(0, 16) + '... (Amane Verified)';
    };

    onMounted(async () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Keep it short and accurate
    recognition.interimResults = false;
    recognition.lang = 'ja-JP'; 

    recognition.onstart = () => {
      isListening.value = true;
      notify('Voice', 'Listening...', 'info');
    };

    recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        if (event.error === 'not-allowed') {
            notify('Voice Error', 'Microphone access denied. Please check browser settings.', 'error');
            isListening.value = false;
        } else if (event.error === 'no-speech') {
            // Just silence, restart if we were expecting input? No, stop for now to avoid loops.
            notify('Voice', 'No speech detected.', 'warning');
            isListening.value = false; 
        } else if (event.error === 'network') {
            notify('Voice Error', 'Network error. Please check connection.', 'error');
             isListening.value = false;
        } else {
            notify('Voice Error', `Error: ${event.error}`, 'error');
            isListening.value = false;
        }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
          await handleVoiceTranscription(transcript);
      }
    };
    // ... existing code ...

    recognition.onend = () => {
      isListening.value = false;
      // If we stopped listening but didn't process anything (and didn't manually stop), notify user
      // Note: This is a simple heuristic. Ideally we track if a result was received.
      // notify('Voice', 'Session Ended', 'info');
    };

    recognitionRef.value = recognition;
  } else {
      notify('System', 'Speech Recognition not supported in this browser.', 'error');
  }
  
  // existing onMounted logic...
  const myPeerId = await peerService.initialize();
});

// Save messages and notebook when they change
watch(messages, (newMessages) => {
  localStorage.setItem('amas_messages_v4', JSON.stringify(newMessages));
}, { deep: true });

watch(notebookEntries, (newEntries) => {
  localStorage.setItem('amas_notebook_v2', JSON.stringify(newEntries));
}, { deep: true });

// Handle anchor/login
const handleAnchor = async (threadsId, igId) => {
  isInitializing.value = true;
  
  try {
    const notebook = await generateSecretNotebook(threadsId, igId);
    
    const newUser = {
      id: `node-${Date.now()}`,
      threadsId,
      instagramId: igId,
      secretNotebook: notebook,
      stateVector: []
    };
    
    user.value = newUser;
    localStorage.setItem('amas_user_v4', JSON.stringify(newUser));
    
    // Re-initialize kernel with history if exists (though usually new user = empty)
    kernelSession.value = createKernelSession([]);
    
    // Initialize P2P with User ID
    peerService.initialize(newUser.threadsId);
    
    peerService.onIncomingCall = (call) => {
      if (confirm(`Incoming Liaison Bridge from ${call.peer}. Accept?`)) {
        startP2PMedia(call.peer, true, call);
      }
    };
  } catch (error) {
    console.error('Initialization error:', error);
    const newUser = {
      id: `node-${Date.now()}`,
      threadsId,
      instagramId: igId,
      secretNotebook: "Identity established via local protocol.",
      stateVector: []
    };
    user.value = newUser;
    localStorage.setItem('amas_user_v4', JSON.stringify(newUser));
  } finally {
    isInitializing.value = false;
  }
};

// Handle send message
const handleSendMessage = async (text) => {
  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date()
  };
  
  messages.value.push(userMsg);
  isLoading.value = true;
  
  try {
    const aiResponse = await sendMessage(kernelSession.value, text);
    
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: aiResponse,
      timestamp: new Date()
    };
    messages.value.push(aiMsg);

    // Auto-save significant AI insights to Notebook
    if (aiResponse.length > 150) {
      const newEntry = {
        id: 'ai-insight-' + Date.now(),
        type: 'standard',
        title: `AI Insight: ${text.substring(0, 20)}...`,
        content: aiResponse,
        timestamp: new Date(),
      };
      notebookEntries.value.unshift(newEntry);
    }
  } catch (error) {
    console.error('AI response error:', error);
    const errorMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: 'Kernel execution fault. Please check your API configuration.',
      timestamp: new Date()
    };
    messages.value.push(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

// Handle voice toggle
const handleToggleVoice = () => {
  if (isListening.value) {
    recognitionRef.value?.stop();
  } else {
    try {
      recognitionRef.value?.start();
    } catch (e) {
      recognitionRef.value?.stop();
      setTimeout(() => recognitionRef.value?.start(), 100);
    }
  }
};

// Handle image import
const handleImport = async (file) => {
  try {
    // 1. Delegate core logic to "Vision Brain" (Composable)
    const resultEntry = await processVisualImport(file);

    // 2. Update Notebook Logic (The "Memory")
    notebookEntries.value.unshift(resultEntry);
    
    // CRITICAL FIX: Automatically switch to Notebook view to show the result
    activeView.value = 'notebook'; 
    notebookFilter.value = 'all'; // Ensure Unified Timeline for new visual content 
    
    // 3. Trigger Antigravity Topology Update
    // (This ensures the map "reacts" to the new semantic weight)
    if (resultEntry.metadata.gravity_nodes?.length > 0) {
        console.log("🌌 Gravity Shift: Topology Updating...", resultEntry.metadata.gravity_nodes);
        
        // If there are specific map references or events, trigger them here.
        // For now, we simulate the "Aura" effect via the notification system which shows the shift.
        notify('Gravity Topology', `Map adjusted: ${resultEntry.metadata.gravity_nodes.length} new nodes anchored.`, 'success');
    }

  } catch (e) {
    console.error('Antigravity Import Error:', e);
  }
};

const handleManualDiaryEntry = (content) => {
  const newEntry = {
    id: Date.now().toString(),
    type: 'diary',
    title: `Diary Entry: ${new Date().toLocaleTimeString()}`,
    content: content,
    timestamp: new Date()
  };
  notebookEntries.value.unshift(newEntry);
  notify('Notebook', 'Diary entry saved.', 'success');
};

const handleContactConnect = ({ contact, type }) => {
  activeCall.value = {
    targetName: contact.nickname,
    intentType: type === 'video' ? 'Video Bridge' : 'Resonance Chat',
    contact: contact
  };
  showFinancePopup.value = true;
  showContactBook.value = false;
};

const startP2PMedia = async (peerId, isIncoming = false, incomingCall = null) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.value = stream;
    showVideoOverlay.value = true;

    if (isIncoming && incomingCall) {
      peerService.answerCall(incomingCall, stream);
    } else {
      await peerService.startVideoCall(peerId, stream);
    }
    
    remoteStream.value = peerService.remoteStream.value;
    
    // Sync remote stream ref
    watch(() => peerService.remoteStream.value, (newVal) => {
      remoteStream.value = newVal;
    });

  } catch (err) {
    console.error("Failed to get media stream", err);
    notify('Media Error', "Could not access camera/mic for P2P Bridge.", 'error');
  }
};

const handleCallAgreement = async (callData) => {
  // console.log("[AMAS_GENESIS_REVIVAL] Agreement reached. Finalizing Directive...", callData);
  
  try {
    // Phase 4: Invisible Finance Execution
    const result = await liaisonService.value.completeDirective(callData);
    // console.log("Directive Finalized:", result);

    // Phase 5: Start Actual P2P Connection
    if (callData.contact && callData.contact.peerId) {
        if (callData.intentType.includes('Video')) {
            await startP2PMedia(callData.contact.peerId);
        } else {
            peerService.connectToPeer(callData.contact.peerId);
            notify('P2P Bridge', `Data Liaison established with ${callData.targetName}`, 'success');
        }
    } else {
        // Fallback for Demo/Self mode (if no peer defined in button click)
        if (callData.intentType.includes('Video') || callData.intentType === 'Liaison') {
             // Treat generic Liaison as video capable for verify
             notify('Self-Resonance', 'Starting self-reflection stream...', 'info');
             const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
             localStream.value = stream;
             showVideoOverlay.value = true;
        }
    }

    // Apple Watch / Status sync
    const newEntry = {
      id: Date.now().toString(),
      type: 'resonance',
      title: 'LIFE WAVE Synchronization',
      content: `Liaison Bridge Established with ${callData.targetName}.\n\nSBT: ${result.sbtId}\nTX: ${result.txHash}`,
      timestamp: new Date(),
    };
    notebookEntries.value.unshift(newEntry);
  } catch (e) {
    console.error("Finalization error:", e);
  }
};

const handleEndCall = () => {
  peerService.endCall();
  showVideoOverlay.value = false;
  localStream.value = null;
  remoteStream.value = null;
};

const handleCommerceReceipt = (receipt) => {
    notebookEntries.value.unshift({
        id: `RECEIPT-${Date.now()}`,
        type: 'COMMERCE_RECEIPT',
        title: `Commerce Receipt: ${receipt.product}`,
        content: `**Product:** ${receipt.product}\n**Value:** ${receipt.price}\n**Resonance Reasoning:** ${receipt.reasoning}\n**Transaction Hash:** \`${receipt.txHash}\` \n\n*Verified via AMAS Privacy Shield*`,
        timestamp: receipt.timestamp,
        icon: 'ShoppingBag'
    });
    
    notify('Notebook Sync', `Commerce Receipt for ${receipt.product} archived.`, 'success');
};

const handleSanctuaryTrigger = async (content) => {
    // 1. Log the trigger as invisible context
    notebookEntries.value.unshift({
        id: 'AMAS-' + Date.now(),
        type: 'scifi',
        title: '🪐 AMAS Synchronization',
        content: `**Trust Sync Initiated**\n\n"${content}"\n\n- Status: Analyzing Context...\n- Protocol: E7 (2637Hz) Resonance`,
        timestamp: new Date()
    });
    
    notify('AMAS OS', 'Tuning into your frequency...', 'info');
    
    // 2. Simulate Analysis Delay (or real AI call)
    setTimeout(() => {
        // 3. Trigger the Sanctuary Popup (Zen UI)
        showSanctuary.value = true;
    }, 800);
};

const handlePresenceTrigger = () => {
    // Simulate JP18991 Proximity Detection
    liaisonService.value.triggerPresence(0.85); // Above 0.5 threshold
  };
  
  // Create a backup of the notebook
  const handleExportNotebook = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notebookEntries.value, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", `amas_notebook_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      notify('System', 'Notebook backup downloaded.', 'success');
  };

const handleVideoChatClick = () => {
  notify('Video Bridge', 'Initializing self-node camera stream...', 'info');
  startP2PMedia(null); 
};

const handleMapClick = () => {
    window.open('https://aim3-ai-map-bright-luxury-608065432512.us-west1.run.app/?did=' + (user.value?.threadsId || 'guest'), '_blank');
};

const handleNotificationRequest = (data, peerId) => {
    notify('Fairy Vert', `${data.message || 'Establish connection?'} (from ${peerId})`, 'info', [
        { 
            label: 'Yes', 
            primary: true,
            onClick: (id) => {
                removeNotification(id);
                peerService.broadcastMessage({ type: 'INVISIBLE_FINANCE_RESPONSE', answer: 'YES' });
                notify('Fairy Vert', 'Agreed. Protocol Active.', 'success');
                showInvisibleFinance.value = true;
            }
        },
        { 
            label: 'Not Know', 
            onClick: (id) => {
                removeNotification(id);
                notify('Amane Oracle', 'Fairy Vert enables value transfer without digital footprints.', 'info');
            }
        },
        { 
            label: 'No', 
            onClick: (id) => {
                removeNotification(id);
                peerService.broadcastMessage({ type: 'INVISIBLE_FINANCE_RESPONSE', answer: 'NO' });
            }
        }
    ]);
};

// ... (in onMessage) ...
// Since onMessage is in a different block (onMounted), I cannot replace both with one contiguous replacement unless I select a huge block.
// I will do two separate edits. First this one for handleNotificationRequest.

const handleFinanceClick = () => {
    if (peerService.connections.value.length > 0) {
        peerService.broadcastMessage({ 
            type: 'INVISIBLE_FINANCE_REQUEST', 
            message: 'Establish invisible connection?' 
        });
        notify('Fairy Vert', 'Request sent to connected peer.', 'info');
    } else {
        notify('System', 'No peers connected. Simulation Mode.', 'warning');
        handleNotificationRequest({ message: 'Establish invisible connection?' }, 'Self');
    }
};

const navigateTo = (view) => {
  activeView.value = view;
  isSidebarOpen.value = false;
};

// DEV UTILITY: Shift+S to test Sanctuary
onMounted(() => {
    window.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'S') {
            console.log('Dev Trigger: Sanctuary');
            showSanctuary.value = true;
        }
    });
});
</script>

<template>
  <!-- Show AnchorScreen if no user -->
  <AnchorScreen 
    v-if="!user" 
    @anchor="handleAnchor" 
    :isLoading="isInitializing" 
  />
  
  <!-- Main App -->
  <div v-else class="fixed inset-0 bg-[#E5E5E5] flex flex-col overflow-hidden font-sans text-[#1A1A1A]">
    <div class="stardust-bg" />

    <!-- Sidebar -->
    <div :class="['fixed left-0 top-0 bottom-0 w-80 bg-white/50 backdrop-blur-3xl border-r border-black/5 z-[400] transition-transform duration-500 transform', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-10 h-full flex flex-col">
        <div class="flex justify-between items-center mb-16">
          <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Amane Core OS</h3>
          <button @click="isSidebarOpen = false" class="p-2 hover:bg-black/5 rounded-full">
            <X :size="16" />
          </button>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="navigateTo('dashboard')"
            :class="['w-full text-left p-6 rounded-[2rem] border transition-all', activeView === 'dashboard' ? 'bg-black text-white shadow-xl' : 'bg-white/60 border-white/40 hover:border-black/20']"
          >
            <div class="flex items-center gap-4">
              <LayoutDashboard :size="14" />
              <span class="text-[11px] font-bold uppercase tracking-widest">Interface</span>
            </div>
          </button>
          
          <button 
            @click="navigateTo('notebook')"
            :class="['w-full text-left p-6 rounded-[2rem] border transition-all', activeView === 'notebook' ? 'bg-black text-white shadow-xl' : 'bg-white/60 border-white/40 hover:border-black/20']"
          >
            <div class="flex items-center gap-4">
              <Book :size="14" />
              <span class="text-[11px] font-bold uppercase tracking-widest">Notebook</span>
            </div>
          </button>
        </div>

        <div class="mt-12 space-y-2">
          <button 
            @click="showContactBook = true"
            class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all bg-teal-500/10 text-teal-600 hover:bg-teal-500/20"
          >
            <component :is="Users" :size="16" />
            Contacts
          </button>
          
          <button 
            v-for="item in [
              { id: 'chat', label: 'Messaging', icon: MessageSquare },
              { id: 'log', label: 'Logs', icon: Terminal },
            ]" 
            :key="item.id"
            @click="navigateTo(item.id)"
            :class="['w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all', activeView === item.id ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black']"
          >
            <component :is="item.icon" :size="16" />
            {{ item.label }}
          </button>

          <!-- New System Integrations -->
          <!-- New System Integrations -->
          <button @click="router.push('/oke')" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-blue-600 hover:bg-blue-600/10">
              <Activity :size="16" />
              <span class="font-serif-luxury text-base tracking-widest">OKE</span>
          </button>

          



          <!-- Sidebar Functions (Moved from Header) -->
          <div class="pt-4 border-t border-black/5 space-y-2">
              <button @click="handleVideoChatClick" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-black/60 hover:text-black hover:bg-black/5">
                  <Video :size="16" />
                  <span>Video Bridge</span>
              </button>

              <button @click="handleFinanceClick" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-emerald-600 hover:bg-emerald-500/10">
                  <CreditCard :size="16" />
                  <span>Invisible Finance</span>
              </button>

              <button @click="handleExportNotebook" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-gray-500 hover:text-black hover:bg-black/5">
                  <Box :size="16" />
                  <span>Archive Data</span>
              </button>

              <button @click="showOKEModal = true" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-black/60 hover:text-black hover:bg-black/5">
                  <ShieldCheck :size="16" />
                  <span>OKE Certification</span>
              </button>

              <button @click="handleMapClick" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-blue-600 hover:bg-blue-600/10">
                  <MapIcon :size="16" />
                  <span>AI Map</span>
              </button>

              <button @click="toggleRecording" :class="['w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all', isRecording ? 'text-red-500 bg-red-500/10' : 'text-black/60 hover:text-black hover:bg-black/5']">
                  <div v-if="isRecording" class="w-4 h-4 bg-red-500 rounded-sm animate-pulse"></div>
                  <div v-else class="w-4 h-4 border-2 border-current rounded-full"></div>
                  <span>Recorder {{ isRecording ? '(ON)' : '(OFF)' }}</span>
              </button>

              <button @click="handlePresenceTrigger" :class="['w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all', isSanctuaryActive ? 'text-teal-600 bg-teal-500/10' : 'text-black/40']">
                  <Fingerprint :size="16" />
                  <span>Presence Protocol</span>
              </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 px-10 py-10 flex justify-between items-center z-[350]">
      <div class="flex items-center gap-6">
        <button @click="isSidebarOpen = true" class="p-3 bg-black text-white rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95">
            <Menu :size="18" />
        </button>
        <div class="hidden md:block">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isSanctuaryActive ? 'bg-teal-400' : 'bg-[#c0a080]']"></span>
              <span :class="['relative inline-flex rounded-full h-2 w-2', isSanctuaryActive ? 'bg-teal-500' : 'bg-[#8b7e74]']"></span>
            </span>
            <span :class="['text-[9px] tracking-widest font-bold uppercase', isSanctuaryActive ? 'text-teal-600' : 'text-[#8b7e74]']">
              {{ isSanctuaryActive ? 'Sanctuary: Active' : 'Resonance: Online' }}
            </span>
          </div>
          <p class="text-[7px] text-black/30 tracking-widest uppercase mt-1">
            {{ isSanctuaryActive ? 'JP18991 Proximity Protocol' : 'Amane Protocol Sync Active' }}
          </p>
        </div>
      </div>


      <!-- Center Navigation Transitions -->
      <!-- Center Navigation Restored: Notebook Only -->
      <div class="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center">
        <button @click="navigateTo('notebook')" :class="['group transition-all hover:scale-105 active:scale-95', activeView === 'notebook' ? 'opacity-100' : 'opacity-60 hover:opacity-100']">
          <span class="font-serif-luxury text-7xl italic tracking-tighter leading-none text-[#1A1A1A]">Notebook</span>
        </button>
      </div>

      <!-- Right: Invisible Finance Entry -->
      <div class="flex items-center gap-4">
        <button 
          @click="showFinancePopup = true" 
          class="flex items-center gap-3 bg-[#1A1A1A] px-6 py-3 rounded-2xl shadow-2xl border border-white/10 hover:scale-105 transition-transform active:scale-95 group"
        >
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Fairy Vert</span>
          <span class="text-sm">🧚</span>
        </button>

        <!-- Menu Button (Far Right) -->
        <button @click="isSidebarOpen = true" class="p-3 bg-white/80 backdrop-blur-md text-black rounded-xl shadow-lg border border-black/5 hover:bg-black hover:text-white transition-all">
            <Menu :size="18" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden flex flex-col min-h-0">
      <PrimaryInterface 
        v-if="activeView === 'dashboard'" 
        :user="user" 
        :isListening="isListening" 
        @toggleVoice="handleToggleVoice"
        @import="handleImport"
        @vision="handleVideoChatClick"
        @textInput="(val) => handleVoiceTranscription(val, true)"
        @forceNotebook="forceNotebook"
      />
      <ChatMessaging 
        v-if="activeView === 'chat'" 
        :messages="messages" 
        :isLoading="isLoading"
        @sendMessage="handleSendMessage" 
      />
      <NotebookView 
        v-if="activeView === 'notebook'" 
        :user="user" 
        :entries="notebookEntries" 
        :filter="notebookFilter"
        :isListening="isListening"
        @trigger-sanctuary="handleSanctuaryTrigger"
        @save-diary="handleManualDiaryEntry"
        @update-filter="(val) => notebookFilter = val"
        @toggle-voice="handleToggleVoice"
        @nav="(view) => {
            if (view === 'oke') router.push('/oke');
            else if (view === 'deployment') router.push('/deployment');
            else if (view === 'map') handleMapClick();
        }"
        @action="(type) => {
            if (type === 'video') handleVideoChatClick();
            else if (type === 'finance') handleFinanceClick();
            else if (type === 'recorder') toggleRecording();
        }"
        @notify="(t, m, type) => notify(t, m, type)"
      />
      <SystemLogs 
        v-if="activeView === 'log'"
        :entries="notebookEntries"
      />
    </main>

    <!-- Invisible Finance Popup (Labeling Caller UI) -->
    <InvisibleFinancePopup 
      v-if="showFinancePopup" 
      :targetName="activeCall?.targetName"
      :intentType="activeCall?.intentType"
      @close="showFinancePopup = false"
      @agreed="handleCallAgreement"
    />

    <!-- Invisible Finance Dashboard -->
    <InvisibleFinance
      v-if="showInvisibleFinance"
      @close="showInvisibleFinance = false"
    />

    <!-- Contact Book Modal -->
    <ContactBook 
      v-if="showContactBook" 
      @close="showContactBook = false"
      @connect="handleContactConnect"
    />

    <!-- P2P Video Overlay -->
    <VideoOverlay 
      v-if="showVideoOverlay"
      :localStream="localStream"
      :remoteStream="remoteStream"
      :targetName="activeCall?.targetName || 'Self-Resonance'"
      @endCall="handleEndCall"
      @commerce-receipt="handleCommerceReceipt"
    />

    <!-- OKE Modal -->
    <div v-if="showOKEModal" class="fixed inset-0 z-[5000] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6" @click.self="showOKEModal = false">
        <div class="max-w-md w-full animate-fade-in-up">
             <AmaneCertificationCard 
                :fact="{
                    model: 'Prototype AIM-3',
                    grade: 9.8,
                    hash: '6ac3f2d1e4a5b6c7d8e9f0a1b2c3d4e5',
                    shortId: '6ac3f2d1'
                }"
             />
             <div class="mt-4 text-center">
                 <button @click="showOKEModal = false" class="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black">Close Certification</button>
             </div>
        </div>
    </div>

    <!-- Sanctuary Popup (Zen UI) -->
    <SanctuaryPopup 
        v-if="showSanctuary"
        :show="showSanctuary"
        @close="showSanctuary = false"
        @confirm="handleSanctuaryConfirm"
    />

    <!-- Notifications -->
    <NotificationToast 
      :notifications="notifications" 
      @remove="removeNotification"
    />
  </div>
</template>
