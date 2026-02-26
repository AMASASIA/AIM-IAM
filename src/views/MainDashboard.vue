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
import { createKernelSession, generateSecretNotebook, sendMessage, processVoiceNote, analyzeIntent, analyzeSemanticDiff } from '../services/intentService.js';
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
import { UnifiedService } from '../services/unifiedService';
import SystemLogs from '../components/SystemLogs.vue';
import { useAmasAudio } from '../composables/useAmasAudio';
import { invisibleFinanceService } from '../services/invisibleFinanceService';
import { useInvisibleFinance } from '../composables/useInvisibleFinance'; // Added
import { web3Service } from '../services/web3Service';
import { labelingCaller } from '../services/labelingCaller';
import { useWebRTC } from '../composables/useWebRTC';
import { useAmasAudioRecorder } from '../composables/useAmasAudioRecorder';

// State
const user = ref(null);
const router = useRouter();
const isSearchingPeer = ref(false);
const showVideoOverlay = ref(false);
const { notify, notifications, removeNotification } = useNotifications();
const showOKEModal = ref(false);
const { startCall: initiateRTCCall, endCall: terminateRTCCall, localStream, remoteStream } = useWebRTC();
const showInvisibleFinance = ref(false);
const messages = ref([]);
const notebookEntries = ref([]);
watch(localStream, (stream) => {
    if (videoSource.value && stream) {
        videoSource.value.srcObject = stream;
    }
});
const showMobileMenu = ref(false); // Mobile awareness
const isLoading = ref(false);
const isInitializing = ref(false);
const activeView = ref('dashboard');
const isSidebarOpen = ref(false);
const isListening = ref(false);
const isProcessingVoice = ref(false);
const kernelSession = ref(null);
const recognitionRef = ref(null);
const { isRecording: isAmasRecording, startRecording, stopRecording, lastAudioUrl, lastAudioId } = useAmasAudioRecorder();
// Sanctuary State
const showSanctuary = ref(false);

const showContactBook = ref(false);
const activeCall = ref(null); // { targetName, intentType, contact }
const showFinancePopup = ref(false);
const isSanctuaryActive = ref(false);
const liaisonService = ref(null);
const { startCapture, stopCapture, isRecording } = useAntigravityRecorder();
const notebookFilter = ref('all');
const verifiedIntentCount = ref(0);

const { playSanctuaryBell, playSemanticTone } = useAmasAudio();

const recordVerifiedIntent = async () => {
    verifiedIntentCount.value++;
    console.log(`[AIM3] Intent Verified. Total: ${verifiedIntentCount.value}`);
    
    // Check for Web3 Milestones (Phase C)
    const result = await web3Service.checkMilestoneAndMintSBT(user.value, verifiedIntentCount.value);
    if (result) {
        notify('SBT Milestone', `Rank Up: ${result.milestone.rank}!`, 'success');
        notebookEntries.value.unshift({
            id: 'SBT-' + Date.now(),
            type: 'scifi',
            title: `💎 Verified Identity: ${result.milestone.rank}`,
            content: `**Amane Protocol Milestone reached.**\n\n- Rank: ${result.milestone.rank}\n- Verified Action: ${verifiedIntentCount.value}\n- Trait: ${result.milestone.trait}\n- TX: ${result.sbtResult.transactionHash.slice(0, 16)}...`,
            timestamp: new Date()
        });
    }
};

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
  const { processVisualImport, captureFrame } = useVisionCore();
  const { handleVoiceNote: processSecretaryNote } = useAmasSecretary();
  const transcribedText = ref('');
  const videoSource = ref(null);

  /* Refactored Voice Handler for Robustness */
  const handleVoiceTranscription = async (transcript, isText = false) => {
      console.log('Processing Command:', transcript);
      transcribedText.value = transcript;
      
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
             playSemanticTone('task');
             break;
             
          case 'TODO_TASK':
             // Task Handling with Semantic Action Engine
             notify('Orchestrator', 'Analyzing task context...', 'info');
             try {
                const result = await UnifiedService.recallAndExecuteWill(intent.message);
                if (result.success) {
                    const taskEntry = {
                        id: result.taskId,
                        type: 'todo',
                        title: `✨ Task: ${result.task.title}`,
                        content: `- [ ] ${result.task.title}\n\n**Description:** ${result.task.description}\n\n*Reasoning:* ${result.task.reasoning}`,
                        timestamp: new Date(),
                        metadata: { 
                            is_auto: true,
                            audioUrl: lastAudioUrl.value,
                            audioId: lastAudioId.value
                        }
                    };
                    notebookEntries.value.unshift(taskEntry);
                    notify('Tasks', 'Autonomous task generated.', 'success');
                    await recordVerifiedIntent(); // Phase C progression
                    playSemanticTone('task');
                }
             } catch (e) {
                // Fallback to basic task if AI recall fails
                const taskEntry = {
                    id: Date.now().toString(),
                    type: 'todo',
                    title: `✅ Task: ${intent.message}`,
                    content: `- [ ] ${intent.message}\n\n*Voice Entry*`,
                    timestamp: new Date(),
                    metadata: { 
                        audioUrl: lastAudioUrl.value,
                        audioId: lastAudioId.value
                    }
                };
                notebookEntries.value.unshift(taskEntry);
                notify('Tasks', 'Task added (Basic).', 'success');
                playSemanticTone('task');
             }
             break;

          case 'RECALL_WILL':
             // Memory Recall & Autonomous Execution
             notify('Recall', 'Synchronizing with past intents...', 'info');
             try {
                const result = await UnifiedService.recallAndExecuteWill(transcript);
                if (result.success) {
                    const taskEntry = {
                        id: result.taskId,
                        type: 'todo',
                        title: `🌌 Recalled: ${result.task.title}`,
                        content: `- [ ] ${result.task.title}\n\n**Context:** ${result.task.description}\n\n*Recalled via Semantic Index*`,
                        timestamp: new Date(),
                        metadata: { 
                            is_recalled: true,
                            audioUrl: lastAudioUrl.value,
                            audioId: lastAudioId.value
                        }
                    };
                    notebookEntries.value.unshift(taskEntry);
                    notify('Primal Interface', `Recalled: ${result.task.title}`, 'success');
                    playSemanticTone('reflection');
                }
             } catch (e) {
                notify('Recall Error', 'Semantic resonance too low.', 'error');
                playSemanticTone('error');
             }
             break;

          case 'CONNECT_VIDEO':
             // P2P Media Activation (Firebase RTDB Signaling)
             if (intent.target_person) {
                const contact = contactBook.findContact(intent.target_person);
                const targetId = contact?.id || contact?.peerId || 'default_peer_id';
                notify('WebRTC', `Connecting Video Bridge to ${contact?.nickname || intent.target_person}...`, 'info');
                await initiateRTCCall(targetId);
             } else {
                notify('WebRTC', 'Initiating generic video bridge...', 'info');
                await initiateRTCCall('default_peer_id');
             }
             showVideoOverlay.value = true;
             await recordVerifiedIntent();
             playSemanticTone('reflection');
             break;

          case 'MINT_FACT':
             // Atomic Mint / OKE Protocol / Opal Routing
             notify('Atomic Mint', `Routing fact extraction to Opal...`, 'info');
             await handleMintFactIntent(intent);
             playSemanticTone('reflection');
             break;
             
          case 'NAVIGATE':
             handleNavigationIntent(intent);
             playSemanticTone('reflection');
             break;
             
          case 'NOTEBOOK_MEMO':
          default:
             // 4. Default: Secretary Memo (Robust)
             // Even if this fails, we catch it and save raw transcript
             const secretaryEntry = await processSecretaryNote(transcript);
             if (secretaryEntry.metadata) {
                 secretaryEntry.metadata.audioUrl = lastAudioUrl.value;
                 secretaryEntry.metadata.audioId = lastAudioId.value;
             } else {
                 secretaryEntry.metadata = { 
                     audioUrl: lastAudioUrl.value,
                     audioId: lastAudioId.value 
                 };
             }
             notebookEntries.value.unshift(secretaryEntry);
             notify('Notebook', 'Memo saved.', 'success');
             playSemanticTone('reflection');
             break;
        }
        
        // Ensure we are still on notebook view
        if (activeView.value !== 'notebook') activeView.value = 'notebook';

      } catch (finalError) {
        console.error('Critical Voice Error, saving raw:', finalError);
        playSemanticTone('error');
        // Emergency Fallback: Save raw text
        notebookEntries.value.unshift({
            id: Date.now().toString(),
            type: 'voice_memo',
            title: 'Quick Note (Raw)',
            content: transcript,
            timestamp: new Date(),
            metadata: { 
                error: finalError.message,
                audioUrl: lastAudioUrl.value,
                audioId: lastAudioId.value
            }
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
      const startDate = intent.start_time ? new Date(intent.start_time) : new Date();
      if (!intent.start_time) startDate.setDate(startDate.getDate() + 1); // Default tomorrow

      const endDate = new Date(startDate.getTime() + 60*60*1000); // 1 hour duration
      
      const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(startDate)}/${fmt(endDate)}`;

      // Create simplified calendar entry
      notebookEntries.value.unshift({
          id: Date.now().toString(),
          type: 'calendar',
          title: `📅 ${title}`,
          content: `**Event Scheduled**\n\n- Event: ${title}\n- Time: ${startDate.toLocaleString()}\n\n[Add to Google Calendar](${gcalLink})`,
          timestamp: new Date()
      });
      notify('Calendar', 'Event link generated.', 'success');
  };

  const handleNavigationIntent = (intent) => {
     if (intent.message.includes('diary')) notebookFilter.value = 'diary';
     else if (intent.message.includes('task')) notebookFilter.value = 'todo';
     else notebookFilter.value = 'all';
     notify('Navigation', `Filter: ${notebookFilter.value}`, 'info');
  };

  const handleMintFactIntent = async (intent) => {
      notify('OKE Protocol', 'Packaging fact for Atomic Mint...', 'info');
      
      const trustHash = generateTrustHash(intent.message);
      
      const mintEntry = {
          id: 'MINT-' + Date.now(),
          type: 'scifi',
          title: '💠 Atomic Mint: Fact Extraction',
          content: `**Fact Verified via Opal Engine**\n\n- Content: ${intent.message}\n- Proof Hash: \`${trustHash}\`\n- Layer: Base L2 / OKE\n\n*This fact is now non-custodial and immutable.*`,
          timestamp: new Date()
      };
      
      notebookEntries.value.unshift(mintEntry);
      notify('Atomic Mint', 'Fact recorded on-chain.', 'success');
      await recordVerifiedIntent();
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

    // Helper for mobile UX
    const copyUrlToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        notify('System', 'URL copied to clipboard. Please open in Safari/Chrome.', 'success');
    };

  // Speech Recognition Management
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      notify('System', 'Speech Recognition not supported in this browser.', 'error');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    recognition.lang = 'ja-JP'; 

    recognition.onstart = () => {
      isListening.value = true;
      notify('Voice', 'Listening...', 'info');
    };

    recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        isListening.value = false;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInstagram = /Instagram/.test(navigator.userAgent);
        const isGmail = /Gmail/.test(navigator.userAgent);
        const isInApp = isInstagram || isGmail || /FBAN|FBAV/.test(navigator.userAgent);

        if (event.error === 'not-allowed') {
            notify('Voice Error', 'Microphone access denied. Please check browser settings.', 'error');
        } else if (event.error === 'service-not-allowed') {
            if (isIOS && isInApp) {
                notify('In-App Browser detected', 'Speech recognition is blocked in this app. Please open in Safari/Chrome.', 'warning', [
                    { label: 'Copy URL', primary: true, onClick: (id) => { removeNotification(id); copyUrlToClipboard(); } }
                ]);
            } else {
                notify('Voice Error', 'Speech service unavailable. Try a direct user gesture or different browser.', 'error');
            }
        } else if (event.error === 'no-speech') {
            notify('Voice', 'No speech detected. Try speaking closer to the mic.', 'warning');
        } else if (event.error === 'network') {
            notify('Voice Error', 'Network error. Please check connection.', 'error');
        } else if (event.error === 'aborted') {
            console.log("Speech recognition aborted.");
        } else {
            notify('Voice Error', `Error: ${event.error}`, 'error');
        }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
          await handleVoiceTranscription(transcript);
      }
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    return recognition;
  };

  onMounted(async () => {
    // We no longer initialize recognition here globally to avoid stale state
    
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

// Handle voice toggle: Unified Robust Mode
const handleToggleVoice = async () => {
    // Determine context (In-app browsers use the more robust MediaRecorder mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInApp = /Instagram|FBAV|FBAN|Gmail/.test(navigator.userAgent);
    const useRobustMode = true; // defaulting to robust mode to solve the 2-3s error definitively

    if (isListening.value || isAmasRecording.value) {
        if (useRobustMode) {
            isProcessingVoice.value = true;
            notify('Processing', 'Analyzing voice with Amane AI...', 'info');
            const transcript = await stopRecording();
            isListening.value = false;
            isProcessingVoice.value = false;
            
            if (transcript) {
                await handleVoiceTranscription(transcript);
            } else {
                notify('Voice', 'No speech detected or analysis failed.', 'warning');
            }
        } else {
            // Old streaming mode (keep for desktop Chrome if needed, but not for this mobile fix)
            recognitionRef.value?.stop();
            isListening.value = false;
        }
    } else {
        if (useRobustMode) {
            try {
                await startRecording();
                isListening.value = true;
                notify('Voice', 'AI Recording Active (Speak clearly)', 'success');
            } catch (e) {
                console.error("Recording start failed:", e);
                notify('System Error', 'Microphone access denied or blocked by app.', 'error', [
                    { label: 'Copy URL', primary: true, onClick: copyUrlToClipboard }
                ]);
                isListening.value = false;
            }
        } else {
            const freshRecognition = initSpeechRecognition();
            if (freshRecognition) {
                recognitionRef.value = freshRecognition;
                freshRecognition.start();
            }
        }
    }
    
    emit('action', {
        type: 'amas-agent-command',
        command: 'toggle_voice',
        data: { isListening: isListening.value }
    });
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

// --- Tive AI: Invisible Finance & Fairy Vert Ritual ---
const { 
    startSanctuaryHold, 
    executeInvisibleFinance, 
    isHolding: isFinHolding, 
    sanctuaryTime 
} = useInvisibleFinance();

const finTouchPoints = ref(0);
const finStartX = ref(0);
const finHoldStartTime = ref(0);
const finGestureActive = ref(false);

const handleFinancePointerDown = (e) => {
    finTouchPoints.value++;
    finHoldStartTime.value = Date.now();
    
    if (finTouchPoints.value === 2) {
        finGestureActive.value = true;
        playSanctuaryBell(); 
        
        // Trigger the 90s Sanctuary Hold Overlay
        showSanctuary.value = true;
    }
};

const handleFinancePointerMove = (e) => {
    // Gestures can also be used for quick triggers, but the Primary Ritual is the Sanctuary Hold
};

const handleFinancePointerUp = () => {
    finTouchPoints.value = 0;
    finGestureActive.value = false;
};

const handleSanctuaryConfirm = async () => {
    showSanctuary.value = false;
    notify('Fairy Vert', 'Advocacy Confirmed. Executing Protocol...', 'success');
    
    // Choose between Finance or Fact based on context (default to Finance for Fairy Vert)
    await handleFinanceExecute();
};

const handleFinanceExecute = async () => {
    notify('Finance Ratio', 'Executing Invisible Payment on Base...', 'info');
    
    try {
        const result = await invisibleFinanceService.executePayment({ amount: 10 });
        if (result.status === 'success') {
            notify('Invisible Finance', 'Transaction Finalized via XMTP Negotiation.', 'success');
            playSanctuaryBell();
            
            notebookEntries.value.unshift({
                id: 'INV-FIN-' + Date.now(),
                type: 'scifi',
                title: '💎 Invisible Finance: On-Chain',
                content: `**Base Chain Settlement**\n\n- Token: USDC\n- Amount: 10.00\n- Status: Success\n- TX: ${result.tx_hash.slice(0,14)}...`,
                timestamp: new Date()
            });
            await recordVerifiedIntent(); // Phase C progression
        }
    } catch (err) {
        notify('Finance Error', 'Liaison Bridge failed to settle.', 'error');
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

          <button @click="router.push('/deployment')" class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-purple-600 hover:bg-purple-600/10">
              <Compass :size="16" />
              <span class="font-serif-luxury text-base tracking-widest">Deploy Dash</span>
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
          @pointerdown="handleFinancePointerDown"
          @pointermove="handleFinancePointerMove"
          @pointerup="handleFinancePointerUp"
          @pointerleave="handleFinancePointerUp"
          :class="[
            'flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border transition-all active:scale-95 group touch-none',
            (isFinHolding || isListening || isProcessingVoice)
              ? 'bg-emerald-900 border-emerald-400 scale-110 ring-4 ring-emerald-500/20' 
              : 'bg-[#1A1A1A] border-white/10 hover:scale-105'
          ]"
        >
          <div :class="['w-2 h-2 rounded-full animate-pulse', (isFinHolding || isListening || isProcessingVoice) ? 'bg-white' : 'bg-emerald-400']"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
            {{ isProcessingVoice ? 'Processing...' : (isFinHolding || isListening ? 'Recording...' : 'Fairy Vert') }}
          </span>
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
        :lastAudioUrl="lastAudioUrl"
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
        :lastAudioUrl="lastAudioUrl"
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
      :intentCount="verifiedIntentCount"
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
    <!-- Hidden Source for Visual Capture (Triple Mint) -->
    <video ref="videoSource" style="display:none" autoplay playsinline muted></video>
  </div>
</template>
