<template>
  <div class="silver-interface animate-fade-in">
    
    <!-- AUTH STAGE (Simplified for MVP) -->
    <div v-if="viewState === 'login'" class="full-stage">
      <div class="vault-login">
        <h1 class="brand-title-oke">OKE</h1>
        <div class="tech-spec">
          <span>ATOMIC_MINT_PROTOCOL</span>
          <span class="atomic-small">v2.0_OPAL</span>
        </div>
        <div class="silver-underline"></div>
        <input v-model="identity" type="text" placeholder="IDENTITY_SOLVE" class="silver-input" @keyup.enter="handleLogin">
        <button class="login-btn-silver" @click="handleLogin">ACCESS_KERNEL</button>
      </div>
    </div>

    <!-- MAIN APP CORE -->
    <div v-else class="app-interface">
      <nav class="system-nav">
        <div class="nav-brand-silver">OKE_FORGE</div>
        <div class="nav-tabs">
          <button :class="{ active: currentTab === 'generate' }" @click="currentTab = 'generate'">FORGE</button>
          <button :class="{ active: currentTab === 'collection' }" @click="currentTab = 'collection'">COLLECTION</button>
        </div>
        <div class="wallet-status">
           <span v-if="walletAddress" class="addr-badge">{{ walletAddress.slice(0,6) }}...{{ walletAddress.slice(-4) }}</span>
           <span v-else class="addr-badge" @click="connectWallet">CONNECT_WALLET</span>
        </div>
      </nav>

      <!-- TAB: MINT (Vertical Forge) -->
      <div v-if="currentTab === 'generate'" class="forge-container-vertical animate-fade-in-quick">
        
        <!-- Visual Core -->
        <div class="visual-core-wrapper">
          <div class="canvas-frame-silver">
             <UniverseGenerator ref="universeGen" />
          </div>
          <div class="gen-strip">
            <div class="gen-row">
              <span class="gen-label">Original</span>
              <input type="range" min="0" max="1" step="0.01" v-model.number="abstractionLevel" @input="onAbstractionChange" class="gen-slider" />
              <span class="gen-label">Universe</span>
            </div>
            <div class="gen-row">
              <button class="gen-btn" :class="{ active: universeGen?.isEvolving?.value }" @click="toggleEvolution">🧬 Evolve</button>
              <span class="gen-info" v-if="universeGen">{{ universeGen.statusText?.value }} · Fitness: {{ (universeGen.fitnessScore?.value || 0).toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <!-- Forge Interface -->
        <div class="forge-form-vertical">
          <div class="type-selector-checks">
             <div v-for="type in ['NFT', 'SBT', 'TBA']" :key="type" @click="toggleType(type)" class="check-item" :class="{ active: selectedTypes.includes(type) }">
               <span class="box">{{ selectedTypes.includes(type) ? '☑' : '☐' }}</span>
               <span class="label">{{ type }}</span>
             </div>
          </div>

          <div class="action-stack">
             <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none;">
             <div class="input-grid">
                <button class="utility-btn-v" @click="triggerFileUpload" :class="{ 'has-file': selectedFile }">
                  {{ selectedFile ? '📎 Data Ready' : '📎 Upload' }}
                </button>
                <button class="utility-btn-v" :class="{ recording: isRecording }" @click="toggleVoiceInput">
                  {{ isRecording ? '🎙 Listening...' : '🎙 Voice Input' }}
                </button>
             </div>

             <div class="mint-execution-area">
                <button class="mint-button-solid" @click="executeAtomicMint" :disabled="minting">
                  <span v-if="!minting">MINT CRYSTAL artifact 🧚</span>
                  <span v-else>Crystallising...</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- TAB: COLLECTION (Trading Card Library) -->
      <div v-if="currentTab === 'collection'" class="collection-view-mobile animate-slide-up">
        <div class="section-head">
           <h2 class="head-title">Collection</h2>
           <div class="head-stats">{{ collectionItems.length }} Assets Archived</div>
        </div>

        <div class="asset-list-vertical">
          <div 
            v-for="item in collectionItems" 
            :key="item.id" 
            class="asset-card-v"
            :class="{ 'is-flipped': flippedCards.includes(item.id) }"
            @click="handleCardInteract(item)"
          >
            <div class="card-inner-v">
              <!-- FRONT FACE -->
              <div class="card-face-front">
                <div class="card-preview">
                   <img v-if="item.image" :src="item.image" class="preview-image-v" />
                   <div class="card-hologram-overlay"></div>
                </div>
                <div class="card-meta">
                  <span class="card-uid">{{ item.id }}</span>
                  <h3 class="card-name">{{ item.name || item.title }}</h3>
                  <div class="card-badges">
                    <span v-for="t in item.types || ['SBT']" :key="t" class="badge-v">{{ t }}</span>
                    <span class="badge-v verified">OKE_VERIFIED</span>
                  </div>
                </div>
                
                <!-- LOCK OVERLAY -->
                <div v-if="!item.unowned && !flippedCards.includes(item.id)" class="lock-indicator-v">🔒</div>
              </div>

              <!-- BACK FACE (UNLOCKED) -->
              <div class="card-face-back">
                <div class="sbt-badge-status">SBT VERIFIED OWNER</div>
                <div class="unlocked-scroll markdown-body-v">
                   <div v-if="loadingArtifactId === item.id">🧚 Verifying signature...</div>
                   <div v-else-if="item.artifactData?.markdown">
                      <div v-html="renderMarkdown(item.artifactData.markdown)"></div>
                   </div>
                   <div v-else>
                      <h2>{{ item.title }}</h2>
                      <p>Ownership confirmed. This artifact contains the crystallised thoughts of @amas. Use your signature to unlock the knowledge layer.</p>
                      <button class="sign-btn-v" @click.stop="handleCardInteract(item)">UNLOCK KNOWLEDGE</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUCCESS MODAL -->
      <div v-if="showSuccess" class="success-overlay animate-fade-in" @click="showSuccess = false">
         <div class="emotional-result-card" @click.stop>
            <div class="oke-card-success animate-slide-up">
               <div class="card-glass-noise"></div>
               <div class="card-visual-frame">
                  <img v-if="lastMinted?.image" :src="lastMinted.image" class="result-image-display" />
                  <div class="card-hologram-sweep"></div>
               </div>
               <div class="card-content-silver">
                  <div class="card-header-v">
                     <span class="card-label">CRYSTALLIZED</span>
                     <span class="card-id-v">{{ lastMinted?.id }}</span>
                  </div>
                  <h2 class="card-title-v">{{ lastMinted?.name }}</h2>
                  <div class="card-footer-v">
                     <div class="hash-wrap">
                        <span class="hash-label">TX_PROOFS</span>
                        <div class="hash-val">{{ lastMinted?.tx }}</div>
                     </div>
                  </div>
               </div>
            </div>
            <button class="close-result" @click="showSuccess = false">CONTINUE</button>
         </div>
      </div>

      <!-- ASSETING OVERLAY -->
      <div v-if="minting" class="asseting-overlay">
        <div class="asseting-core">
           <div class="pulsing-sphere"></div>
           <div class="asseting-text">CRYSTALLISING...</div>
           <div class="log-stream">
              <p>Binding Atomic structure...</p>
              <p>Encoding 432Hz Sound Wave...</p>
              <p>Sealing with OKE Identity...</p>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { executeAtomicMint as okeAtomicMint, subscribeToCards } from '../services/okeService';
import { web3Service } from '../services/web3Service';
import UniverseGenerator from './UniverseGenerator.vue';
import { marked } from 'marked';

// State
const viewState = ref('login');
const identity = ref('');
const currentTab = ref('generate');
const minting = ref(false);
const showSuccess = ref(false);
const selectedTypes = ref(['NFT', 'SBT', 'TBA']);
const lastMinted = ref(null);
const collectionItems = ref([]);
const flippedCards = ref([]);
const loadingArtifactId = ref(null);

const universeGen = ref(null);
const abstractionLevel = ref(0.6);
const fileInput = ref(null);
const selectedFile = ref(null);
const isRecording = ref(false);
const walletAddress = ref('');
const voiceTranscript = ref(''); // Capture voice input for crystallization

// --- TACTILE FEEDBACK (Bell Sound) ---
const playBell = () => {
    try {
        const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        bell.volume = 0.3;
        bell.play();
    } catch(e) { console.warn('Audio feedback failed'); }
};

/**
 * ON-DEVICE SPEECH RECOGNITION (Privacy Implementation)
 * Leveraging Chrome 139+ On-device Speech API if available.
 */
const initRecognition = () => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRec();
        recog.continuous = false;
        recog.lang = 'ja-JP';
        recog.onresult = (event) => {
            voiceTranscript.value = event.results[0][0].transcript;
            console.log('[OKE] On-device Intent Captured:', voiceTranscript.value);
            isRecording.value = false;
        };
        recog.onerror = (e) => {
            console.error('[OKE] Speech Error:', e.error);
            isRecording.value = false;
        };
        recog.onend = () => {
            isRecording.value = false;
        };
        return recog;
    }
    return null;
};
let recognition = null;

const handleLogin = async () => {
  viewState.value = 'app';
  try {
    const { address } = await web3Service.connectWallet();
    walletAddress.value = address;
  } catch (e) { console.warn('[OKE] Wallet connect skipped'); }

  unsubscribeCards = subscribeToCards((cards) => {
    collectionItems.value = cards;
  });
};

const renderMarkdown = (md) => marked.parse(md || '');

async function handleCardInteract(item) {
  if (flippedCards.value.includes(item.id)) {
    flippedCards.value = flippedCards.value.filter(id => id !== item.id);
    return;
  }

  loadingArtifactId.value = item.id;
  try {
    const hasSBT = await web3Service.checkSBTBalance();
    if (!hasSBT) {
      alert('Ownership required to unlock this Artifact. Please Mint/Purchase first.');
      return;
    }
    await web3Service.signMessageForAccess(item.id);
    flippedCards.value.push(item.id);
  } catch (e) {
    console.error('Signature failed', e);
  } finally {
    loadingArtifactId.value = null;
  }
}

const toggleType = (t) => {
  const i = selectedTypes.value.indexOf(t);
  if (i > -1) { if (selectedTypes.value.length > 1) selectedTypes.value.splice(i, 1); }
  else selectedTypes.value.push(t);
};

const triggerFileUpload = () => fileInput.value?.click();
const handleFileSelect = (e) => {
  if (e.target.files[0]) {
    selectedFile.value = e.target.files[0];
    if (universeGen.value) universeGen.value.injectImage(e.target.files[0]);
  }
};

const toggleVoiceInput = () => {
    if (isRecording.value) {
        recognition?.stop();
        isRecording.value = false;
    } else {
        voiceTranscript.value = '';
        recognition = initRecognition();
        if (!recognition) {
            alert('Speech recognition not supported in this browser.');
            return;
        }
        try {
            recognition.start();
            isRecording.value = true;
            if (universeGen.value) universeGen.value.toggleAudio();
        } catch (e) {
            console.error('[OKE] Start failed:', e);
            isRecording.value = false;
        }
    }
};

const onAbstractionChange = () => universeGen.value?.setAbstraction(abstractionLevel.value);
const toggleEvolution = () => universeGen.value?.toggleEvolution();

const executeAtomicMint = async () => {
    if (minting.value) return;
    minting.value = true;
    try {
        const generatedImage = universeGen.value?.exportDataURL() || '';
        
        // Phase 1: Crystallize Intent (Pattern 1 Backend - Gemini Pro)
        const crystallizeRes = await fetch('/api/artifacts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rawInput: voiceTranscript.value || (selectedFile.value ? `FILE:${selectedFile.value.name}` : 'Atomic Observation'),
                imageBase64: generatedImage,
                identity: identity.value,
                location: { lat: 35.6895, lng: 139.6917 } 
            })
        });
        const crystal = await crystallizeRes.json();
        if (!crystal.success) throw new Error('Crystallization failed');
        
        // Phase 2: Atomic Mint (Web3 + OPAL HD)
        const result = await okeAtomicMint({
            address: walletAddress.value,
            metadata: crystal.card,
            types: [...selectedTypes.value],
            useOpal: true // OPAL Masterpiece generation
        });

        lastMinted.value = { ...crystal.card, ...result, image: result.imageUrl || generatedImage };
        showSuccess.value = true;
        
        // Tactile Feedback
        playBell();
        console.log('[OKE] Atomic Mint Completed via Pattern 1 Architecture.');

    } catch (e) {
        console.error('Minting failed', e);
        alert('Minting failed: ' + e.message);
    } finally {
        minting.value = false;
    }
};

let unsubscribeCards = null;
onUnmounted(() => { if (unsubscribeCards) unsubscribeCards(); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@300;500&family=Outfit:wght@200;400;700&display=swap');

.silver-interface { background: #000; color: #fff; min-height: 100vh; font-family: 'Outfit', sans-serif; }
.full-stage { height: 100vh; display: flex; align-items: center; justify-content: center; }
.vault-login { text-align: center; max-width: 320px; }
.brand-title-oke { font-family: 'Cinzel', serif; font-size: 4rem; letter-spacing: 12px; }
.silver-input { width: 100%; border: none; border-bottom: 1px solid #333; background: transparent; color: #fff; text-align: center; padding: 15px; outline: none; margin: 20px 0; font-family: 'JetBrains Mono'; }
.login-btn-silver { border: 1px solid #fff; background: transparent; color: #fff; padding: 10px 40px; cursor: pointer; letter-spacing: 2px; }

.system-nav { display: flex; justify-content: space-between; padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.nav-tabs button { background: none; border: none; color: #444; font-weight: 700; cursor: pointer; margin-right: 20px; transition: 0.3s; }
.nav-tabs button.active { color: #fff; text-decoration: underline; }
.addr-badge { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #666; cursor: pointer; }

.forge-container-vertical { display: flex; flex-direction: column; align-items: center; padding: 40px; }
.visual-core-wrapper { margin-bottom: 40px; }
.canvas-frame-silver { padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }

.type-selector-checks { display: flex; gap: 20px; margin-bottom: 30px; }
.check-item { cursor: pointer; color: #555; }
.check-item.active { color: #fff; }

.mint-button-solid { width: 100%; background: #fff; color: #000; padding: 15px; border: none; font-weight: 700; cursor: pointer; letter-spacing: 2px; }

/* TRADING CARD 3D */
.asset-list-vertical { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 40px; padding: 20px; }
.asset-card-v { perspective: 1000px; height: 480px; }
.card-inner-v { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; }
.asset-card-v.is-flipped .card-inner-v { transform: rotateY(180deg); }

.card-face-front, .card-face-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.card-face-front { background: #050505; }
.card-face-back { background: #0a0a0f; transform: rotateY(180deg); padding: 30px; overflow-y: auto; }

.card-preview { height: 60%; background: #000; position: relative; }
.preview-image-v { width: 100%; height: 100%; object-fit: cover; }
.card-hologram-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%); background-size: 200%; animation: holo 4s infinite linear; }
@keyframes holo { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.card-meta { padding: 20px; }
.card-uid { font-family: 'JetBrains Mono'; font-size: 0.5rem; color: #444; }
.card-name { font-family: 'Cinzel'; font-size: 1.2rem; margin: 5px 0; }

.lock-indicator-v { position: absolute; top: 10px; right: 10px; font-size: 1.2rem; filter: grayscale(1); opacity: 0.5; }
.sbt-badge-status { color: #4ade80; font-size: 0.6rem; letter-spacing: 2px; border: 1px solid #4ade80; padding: 4px 10px; border-radius: 20px; margin-bottom: 20px; display: inline-block; }
.unlocked-scroll { color: #ccc; font-size: 0.9rem; line-height: 1.6; }

.asseting-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.asseting-core { text-align: center; }
.pulsing-sphere { width: 60px; height: 60px; background: #fff; border-radius: 50%; margin: 0 auto 20px; animation: pulse 1s infinite alternate; }
@keyframes pulse { from { transform: scale(1); opacity: 0.5; } to { transform: scale(1.2); opacity: 1; } }

/* SUCCESS MODAL */
.success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 4000; }
.oke-card-success { width: 320px; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
.card-visual-frame { width: 100%; aspect-ratio: 1; overflow: hidden; }
.result-image-display { width: 100%; height: 100%; object-fit: cover; }
.card-content-silver { padding: 24px; }
.card-title-v { font-family: 'Cinzel'; margin: 10px 0; }

.animate-fade-in { animation: fadeIn 1s; }
.animate-slide-up { animation: slideUp 0.6s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
