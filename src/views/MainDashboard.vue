<script setup>
import { ref, watch, onMounted } from 'vue';
import { Menu, X, LayoutDashboard, MessageSquare, Video, Terminal, Compass, Shield, Fingerprint, Users } from 'lucide-vue-next';
import AnchorScreen from '../components/AnchorScreen.vue';
import ChatMessaging from '../components/ChatMessaging.vue';
import NotebookView from '../components/NotebookView.vue';
import PrimaryInterface from '../components/PrimaryInterface.vue';
import ContactBook from '../components/ContactBook.vue';
import InvisibleFinancePopup from '../components/InvisibleFinancePopup.vue';
import InvisibleFinance from '../components/InvisibleFinance.vue';
import { createKernelSession, generateSecretNotebook, sendMessage, processVoiceNote, analyzeImage, analyzeIntent, analyzeSemanticDiff } from '../services/geminiService.js';
import { processAssetToGateway } from '../services/assetService.js';
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
import SystemLogs from '../components/SystemLogs.vue';
import { labelingCaller } from '../services/labelingCaller';

// State
const user = ref(null);
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
const showContactBook = ref(false);
const activeCall = ref(null); // { targetName, intentType, contact }
const showFinancePopup = ref(false);
const isSanctuaryActive = ref(false);
const liaisonService = ref(null);
const { startCapture, stopCapture, isRecording } = useAntigravityRecorder();

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
  
  const savedNotebook = localStorage.getItem('amas_notebook_v1');
  if (savedNotebook) {
    notebookEntries.value = JSON.parse(savedNotebook).map(e => ({
      ...e,
      timestamp: new Date(e.timestamp)
    }));
  }

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
  const handleVoiceTranscription = async (transcript) => {
      console.log('Processing Command:', transcript);
      notify('Amane Core', 'Processing thought sequence...', 'info');
      
      try {
        // Step 1: Analyze intent using AI
        const intent = await analyzeIntent(transcript);
        console.log('AI Intent analysis:', intent);
        
        // Step 2: Handle based on intent
        switch (intent.intent) {
          case 'CONNECT_VIDEO':
          case 'CONNECT_CHAT':
            // Find contact in address book
            if (intent.target_person) {
              try {
                  const result = await labelingCaller.execute({ nickname: intent.target_person });
                  
                  // Set active call data to trigger the sanctuary popup
                  activeCall.value = {
                    targetName: result.contact.nickname,
                    intentType: intent.intent === 'CONNECT_VIDEO' ? 'Video Bridge' : 'Resonance Chat',
                    contact: result.contact
                  };
                  showFinancePopup.value = true;
                  
                  // Log to notebook
                  const newEntry = {
                    id: Date.now().toString(),
                    type: 'system',
                    title: `Resonance Call: ${result.contact.nickname}`,
                    content: `Initiated ${intent.intent === 'CONNECT_VIDEO' ? 'video' : 'chat'} resonance via labeling caller.\nTarget: @${result.contact.threadsId || result.contact.instagramId}`,
                    timestamp: new Date(),
                  };
                  notebookEntries.value.unshift(newEntry);
              } catch (err) {
                  alert(err.message);
              }
            } else {
              alert('🤔 Could not identify who you want to connect with.\nPlease say their name clearly.');
            }
            break;
            
          case 'ADD_CONTACT':
            // Show contact add dialog (simplified for now)
            alert(`📇 Add Contact Feature\n\nDetected: ${intent.target_person}\nMessage: ${intent.message}\n\n(Contact management UI will be added)`);
            break;
            
          case 'MESSAGE':
            // Route to Chat Interface directly
            if (activeView.value !== 'chat') activeView.value = 'chat';
            await handleSendMessage(intent.message || transcript);
            break;

          case 'SCHEDULE_EVENT':
            // Schedule handling
            const scheduleEntry = {
              id: Date.now().toString(),
              type: 'calendar',
              title: `📅 ${intent.message}`,
              content: `**Google Calendar Sync Active**\n\nDetails: ${intent.details || 'Detected in context'}\n\n[Open Google Calendar](https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(intent.message)}&details=${encodeURIComponent(intent.details || '')})`,
              timestamp: new Date(),
            };
            notebookEntries.value.unshift(scheduleEntry);
            notify('Google Calendar', `Event scheduled: ${intent.message}`, 'success');
            break;

          case 'TODO_TASK':
            // Task/To-Do handling
            const taskEntry = {
              id: Date.now().toString(),
              type: 'todo',
              title: `✅ Task: ${intent.message}`,
              content: `- [ ] ${intent.details || intent.message}\n\n*Added via Voice Command*`,
              timestamp: new Date(),
            };
            notebookEntries.value.unshift(taskEntry);
            notify('Tasks', `Added to list: ${intent.message}`, 'success');
            break;

          case 'NOTEBOOK_MEMO':
          default:
            // Save as notebook entry
            activeView.value = 'notebook'; // Auto-switch to notebook to show result
            const refinedNote = await processVoiceNote(transcript);
            const newEntry = {
              id: Date.now().toString(),
              type: 'standard',
              title: `Voice Memo: ${new Date().toLocaleTimeString()}`,
              content: refinedNote,
              timestamp: new Date(),
            };
            notebookEntries.value.unshift(newEntry);
            break;
        }
      } catch (e) {
        console.error('Command processing error:', e);
      }
    };

  // Initialize speech recognition
  onMounted(async () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => {
      isListening.value = true;
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await handleVoiceTranscription(transcript);
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    recognitionRef.value = recognition;
  }
  
  // existing onMounted logic...
  const myPeerId = await peerService.initialize();
});

// Save messages and notebook when they change
watch(messages, (newMessages) => {
  localStorage.setItem('amas_messages_v4', JSON.stringify(newMessages));
}, { deep: true });

watch(notebookEntries, (newEntries) => {
  localStorage.setItem('amas_notebook_v1', JSON.stringify(newEntries));
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
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fullBase64 = e.target?.result;
      const base64 = fullBase64.split(',')[1];
      
      try {
        // AI解析と同時に、独立バックエンド（Gateway）へ鑑定リクエスト
        const [insight, gatewayResult] = await Promise.all([
          analyzeImage(base64, file.type),
          processAssetToGateway(file, "Manual Import via Onyx Interface")
        ]);
        
        console.log("[Amane Gateway] Certification Received:", gatewayResult);

        const newEntry = {
          id: Date.now().toString(),
          type: 'visual_diary',
          title: `Visual Diary: ${file.name}`,
          content: insight,
          timestamp: new Date(),
          metadata: { 
            image: fullBase64,
            certification_id: gatewayResult.certification_id,
            oke_facts: gatewayResult.atomic_facts,
            amane_link: gatewayResult.amane_link
          }
        };
        
        notebookEntries.value.unshift(newEntry);
        
        // 通知
        notify('OKE Certified', `${file.name} has been verified.\nCID: ${gatewayResult.certification_id}`, 'success');
      } catch (error) {
        console.error('Image analysis error:', error);
      }
    };
    reader.readAsDataURL(file);
  } catch (e) {
    console.error('File read error:', e);
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

const handlePresenceTrigger = () => {
  // Simulate JP18991 Proximity Detection
  liaisonService.value.triggerPresence(0.85); // Above 0.5 threshold
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
</script>

<template>
  <!-- Show AnchorScreen if no user -->
  <AnchorScreen 
    v-if="!user" 
    @anchor="handleAnchor" 
    :isLoading="isInitializing" 
  />
  
  <!-- Main App -->
  <div v-else class="fixed inset-0 bg-[#E5E5E5] flex flex-col overflow-hidden font-sans select-none text-[#1A1A1A]">
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

          <!-- Sidebar Functions (Moved from Header) -->
          <div class="pt-4 border-t border-black/5 space-y-2">
              <button @click="handleVideoChatClick" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-black/60 hover:text-black hover:bg-black/5">
                  <Video :size="16" />
                  <span>Video Bridge</span>
              </button>

              <button @click="handleFinanceClick" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-emerald-600 hover:bg-emerald-500/10">
                  <CreditCard :size="16" />
                  <span>🍃Invisible Finance</span>
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

      <button 
        @click="navigateTo('notebook')" 
        :class="['absolute left-1/2 -translate-x-1/2 font-serif-luxury text-4xl md:text-5xl transition-all duration-700 tracking-tighter italic font-bold', activeView === 'notebook' ? 'text-black opacity-100 scale-105' : 'text-black/30 hover:text-black/60']"
      >
        Notebook
      </button>

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
    <main class="flex-1 relative">
      <PrimaryInterface 
        v-if="activeView === 'dashboard'" 
        :user="user" 
        :isListening="isListening" 
        @toggleVoice="handleToggleVoice"
        @import="handleImport"
        @vision="handleVideoChatClick"
        @textInput="handleVoiceTranscription"
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
        @save-diary="handleManualDiaryEntry"
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

    <!-- Notifications -->
    <NotificationToast 
      :notifications="notifications" 
      @remove="removeNotification"
    />
  </div>
</template>
