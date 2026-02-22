<template>
  <div class="silver-interface">
    
    <!-- PHASE 1: IDENTITY LOGIN -->
        <div v-if="viewState === 'login'" class="full-stage animate-fade-in">
           <div class="vault-login">
              <div class="identity-header">
                 <h1 class="brand-title-oke">OKE</h1>
                 <div class="tech-spec"><span class="atomic-small">Atomic Mint</span></div>
              </div>
              <div class="input-group-silver">
                 <div class="input-wrapper">
                    <input 
                      v-model="identity" 
                      type="email" 
                      placeholder="Email Address" 
                      class="silver-input"
                      @keyup.enter="handleLogin"
                    />
                    <div class="silver-underline"></div>
                 </div>
              </div>
              <button class="login-btn-silver" @click="handleLogin" v-if="identity">
                ENTER
              </button>
           </div>
        </div>

        <!-- PHASE 2: SYSTEM INTERFACE -->
        <div v-else class="system-interface">
          <nav class="system-nav">
            <div class="nav-brand-silver">OKE <span class="divider">/</span> <span class="status-active">SYNC</span></div>
            <div class="nav-tabs">
              <button :class="{ active: currentTab === 'generate' }" @click="currentTab = 'generate'">MINT</button>
              <button :class="{ active: currentTab === 'collection' }" @click="currentTab = 'collection'">COLLECTION</button>
              <button class="logout-link" @click="viewState = 'login'">EXIT</button>
            </div>
          </nav>

          <!-- TAB: MINT (Vertical Forge) -->
          <div v-if="currentTab === 'generate'" class="forge-container-vertical animate-fade-in-quick">
            
            <!-- Visual Core -->
            <div class="visual-core-wrapper">
              <div class="canvas-frame-silver">
                 <canvas ref="kaleidoscopeCanvas" width="280" height="280" class="kaleidoscope-canvas"></canvas>
              </div>
            </div>

            <!-- Forge Interface -->
            <div class="forge-form-vertical">
              <div class="type-selector-checks">
                 <div 
                   v-for="type in ['NFT', 'SBT', 'TBA']" 
                   :key="type"
                   @click="toggleType(type)"
                   class="check-item"
                   :class="{ active: selectedTypes.includes(type) }"
                 >
                   <span class="box">{{ selectedTypes.includes(type) ? '☑' : '☐' }}</span>
                   <span class="label">{{ type }}</span>
                 </div>
              </div>

          <div class="asset-details" v-if="selectedFile">
             <div class="file-info-badge">
                <span class="label">SOURCE:</span> {{ selectedFile.name }}
             </div>
          </div>

          <div class="action-stack">
             <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none;">
             
             <div class="input-grid">
                <button class="utility-btn-v" @click="triggerFileUpload">
                  {{ selectedFile ? 'Asset Ready' : 'Upload Data' }}
                </button>
                <button class="utility-btn-v" :class="{ recording: isRecording }" @click="toggleVoiceInput">
                  {{ isRecording ? 'Recording...' : 'Add Voice' }}
                </button>
             </div>

             <div class="mint-execution-area">
                <button class="mint-button-solid" @click="executeAtomicMint" :disabled="minting">
                  <span v-if="!minting">MINT</span>
                  <span v-else>Asseting...</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- TAB: COLLECTION -->
      <div v-if="currentTab === 'collection'" class="collection-view-mobile animate-slide-up">
        <div class="section-head">
           <h2 class="head-title">Collection</h2>
           <div class="head-stats">{{ collectionItems.length }} Assets Archived</div>
        </div>

        <div class="asset-list-vertical">
          <div v-for="item in collectionItems" :key="item.id" class="asset-card-v" @click="showDetailedResult(item)">
            <div class="card-preview">
               <canvas :id="`canvas-${item.id}`" width="400" height="400" class="preview-canvas-v"></canvas>
            </div>
            <div class="card-meta">
              <span class="card-uid">{{ item.id }}</span>
              <h3 class="card-name">{{ item.name }}</h3>
              <div class="card-badges">
                <span v-for="t in item.types" :key="t" class="badge-v">{{ t }}</span>
                <span class="badge-v verified">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUCCESS MODAL: EMOTIONAL RESULT -->
      <div v-if="showSuccess" class="success-overlay animate-fade-in" @click="showSuccess = false">
         <div class="emotional-result-card" @click.stop>
            <div class="result-glow"></div>
            <div class="result-visual">
               <canvas id="success-canvas" width="500" height="500"></canvas>
            </div>
            <div class="result-text">
               <div class="success-label">CRYSTALLIZED</div>
               <h2 class="success-name">{{ lastMinted?.name }}</h2>
               <div class="success-hash">{{ lastMinted?.tx }}</div>
               <button class="close-result" @click="showSuccess = false">CONTINUE</button>
            </div>
         </div>
      </div>

      <!-- RITUAL: ASSETING UI -->
      <div v-if="minting" class="asseting-overlay">
        <div class="asseting-core">
           <div class="pulsing-sphere"></div>
           <div class="asseting-text">Asseting...</div>
           <div class="log-stream">
              <p>Binding Atomic structure ({{ selectedTypes.join(' + ') }})...</p>
              <p>Verifying identity anchor...</p>
              <p>Establishing consensus...</p>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

// State
const viewState = ref('login');
const identity = ref('');
const currentTab = ref('generate');
const minting = ref(false);
const showSuccess = ref(false);
const selectedTypes = ref(['NFT', 'SBT', 'TBA']); // Multi-select enabled
const lastMinted = ref(null);

const kaleidoscopeCanvas = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const isRecording = ref(false);
const previewSeed = ref(1.0);

const collectionItems = ref([
  { id: 'OKE-A1', name: 'Original Genesis', seed: 1.2, types: ['NFT', 'SBT', 'TBA'] },
  { id: 'OKE-B7', name: 'Identity Proof', seed: 0.8, types: ['SBT'] }
]);

const handleLogin = () => {
  viewState.value = 'app';
};

const toggleType = (type) => {
    const index = selectedTypes.value.indexOf(type);
    if (index > -1) {
        if (selectedTypes.value.length > 1) {
            selectedTypes.value.splice(index, 1);
        }
    } else {
        selectedTypes.value.push(type);
    }
};

const triggerFileUpload = () => fileInput.value?.click();
const handleFileSelect = (e) => {
    if (e.target.files[0]) {
        selectedFile.value = e.target.files[0];
        previewSeed.value = (e.target.files[0].lastModified % 5) + 2; 
    }
};
const toggleVoiceInput = () => isRecording.value = !isRecording.value;

const executeAtomicMint = async () => {
    if (minting.value) return;
    minting.value = true;
    
    // Simulate Asseting process
    setTimeout(async () => {
        const tx = "0x" + Math.random().toString(16).slice(2, 10).toUpperCase();
        const newItem = {
            id: 'OKE-' + Date.now().toString(16).slice(-4).toUpperCase(),
            name: selectedFile.value ? selectedFile.value.name : 'Atomic Fact',
            seed: previewSeed.value + Math.random(),
            types: [...selectedTypes.value],
            tx: tx
        };
        
        lastMinted.value = newItem;
        collectionItems.value.unshift(newItem);
        minting.value = false;
        
        // Emotional Transition
        await nextTick();
        showSuccess.value = true;
        drawSuccessVisual();
    }, 3500);
};

// Physics Painting
const drawPhysic = (ctx, config) => {
  const phi = 1.61803398875;
  const { symmetry, color, lineWeight } = config;
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const maxR = Math.sqrt(cx*cx + cy*cy);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWeight;

  for (let i = 0; i < symmetry; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.PI * 2 / symmetry) * i);
    ctx.beginPath();
    let r = 2;
    let px = 2, py = 0;
    const k = Math.log(phi) / (Math.PI / 2);
    for (let t = 0; t < Math.PI * 5; t += 0.1) {
      const currentR = r * Math.exp(k * t);
      const x = currentR * Math.cos(t);
      const y = currentR * Math.sin(t);
      if (currentR > maxR) break;
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      px = x; py = y;
    }
    ctx.stroke();
    ctx.restore();
  }
};

const drawSuccessVisual = () => {
    const el = document.getElementById('success-canvas');
    if (!el) return;
    const ctx = el.getContext('2d');
    const draw = () => {
        if (!showSuccess.value) return;
        const t = Date.now() * 0.001;
        ctx.clearRect(0,0,500,500);
        ctx.save();
        ctx.translate(250,250);
        ctx.rotate(t * 0.5);
        drawPhysic(ctx, { symmetry: 24, color: 'rgba(255,255,255,0.15)', lineWeight: 0.5 });
        ctx.restore();
        requestAnimationFrame(draw);
    };
    draw();
};

onMounted(() => {
    const loop = () => {
        const t = Date.now() * 0.0003;

        if (kaleidoscopeCanvas.value && currentTab.value === 'generate') {
            const ctx = kaleidoscopeCanvas.value.getContext('2d');
            ctx.clearRect(0,0,280,280);
            ctx.save();
            ctx.translate(140,140);
            ctx.rotate(t);
            drawPhysic(ctx, { symmetry: 10, color: 'rgba(210, 215, 211, 0.4)', lineWeight: 1 });
            ctx.restore();
        } else if (currentTab.value === 'collection') {
            collectionItems.value.forEach(item => {
                const el = document.getElementById(`canvas-${item.id}`);
                if (el) {
                    const ctx = el.getContext('2d');
                    ctx.clearRect(0,0,400,400);
                    ctx.save();
                    ctx.translate(200,200);
                    ctx.rotate(t * 0.3 * item.seed);
                    drawPhysic(ctx, { symmetry: 8, color: 'rgba(255,255,255,0.2)', lineWeight: 0.8 });
                    ctx.restore();
                }
            });
        }
        requestAnimationFrame(loop);
    };
    loop();
});
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/chomsky');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@300;500&family=Outfit:wght@200;400;700&display=swap');

.silver-interface {
  background: #000;
  color: #fff;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  padding-bottom: 40px;
}

/* AUTH */
.full-stage { height: 100vh; display: flex; align-items: center; justify-content: center; }
.vault-login { text-align: center; width: 100%; max-width: 320px; }

.brand-title-oke { 
  font-family: 'Cinzel', serif; 
  font-size: 4rem; 
  letter-spacing: 10px; 
  color: #fff; 
  margin-bottom: 5px; 
  text-shadow: 0 0 40px rgba(255,255,255,0.1);
}

.tech-spec { 
  font-family: 'JetBrains Mono', monospace; 
  font-size: 0.6rem; 
  color: #666; 
  letter-spacing: 2px; 
  margin-bottom: 40px; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.atomic-small {
  font-size: 0.7rem;
  font-weight: 700;
  color: #aaa;
  border-left: 1px solid #333;
  padding-left: 10px;
  letter-spacing: 1px;
}

.silver-input { width: 100%; background: transparent; border: none; padding: 15px 0; color: #fff; text-align: center; font-family: 'JetBrains Mono', monospace; outline: none; }
.silver-underline { height: 1px; background: linear-gradient(90deg, transparent, #c0c0c0, transparent); }
.login-btn-silver { border: 1px solid #c0c0c0; background: transparent; color: #fff; padding: 10px 40px; font-size: 0.75rem; letter-spacing: 2px; margin-top: 30px; cursor: pointer; }

/* NAV */
.system-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.nav-brand-silver { font-family: 'Cinzel', serif; font-size: 1.4rem; letter-spacing: 2px; }
.nav-tabs { display: flex; gap: 20px; }
.nav-tabs button { background: none; border: none; color: #666; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.75rem; letter-spacing: 1px; cursor: pointer; }
.nav-tabs button.active { color: #fff; border-bottom: 1px solid #fff; }

/* VERTICAL FORGE */
.forge-container-vertical { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
.visual-core-wrapper { margin-bottom: 40px; }
.canvas-frame-silver { padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }

.forge-form-vertical { width: 100%; max-width: 340px; }

.type-selector-checks {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  opacity: 0.4;
  transition: 0.3s;
}

.check-item.active {
  opacity: 1;
}

.check-item .box {
  font-size: 1rem;
  color: #fff;
}

.check-item .label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.utility-btn-v { background: rgba(255,255,255,0.03); border: 1px solid #222; color: #888; padding: 12px; font-size: 0.7rem; cursor: pointer; }
.mint-button-solid { width: 100%; padding: 20px; background: #fff; color: #000; border: none; font-weight: 700; letter-spacing: 4px; cursor: pointer; margin-top: 10px; }
.mint-button-solid:active { transform: scale(0.98); }

/* ASSETING OVERLAY */
.asseting-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.asseting-core { text-align: center; }
.pulsing-sphere { width: 40px; height: 40px; background: #fff; border-radius: 50%; margin: 0 auto 20px auto; animation: pulse-sphere 1.5s infinite alternate ease-in-out; }
.asseting-text { font-family: 'Chomsky', serif; font-size: 1.8rem; letter-spacing: 2px; margin-bottom: 30px; }
.log-stream { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #444; line-height: 2.5; }

@keyframes pulse-sphere { from { transform: scale(1); box-shadow: 0 0 10px #fff; } to { transform: scale(1.4); box-shadow: 0 0 40px #fff; } }

/* SUCCESS MODAL */
.success-overlay { position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; align-items: center; justify-content: center; }
.emotional-result-card { position: relative; text-align: center; width: 100%; max-width: 500px; }
.result-visual { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: -1; }
.result-text { padding: 40px; }
.success-label { font-size: 0.6rem; letter-spacing: 4px; color: #666; margin-bottom: 10px; }
.success-name { font-family: 'Chomsky', serif; font-size: 3rem; margin-bottom: 20px; text-shadow: 0 0 20px rgba(255,255,255,0.4); }
.success-hash { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #444; margin-bottom: 60px; }
.close-result { background: #fff; color: #000; padding: 12px 30px; border: none; font-weight: 700; font-size: 0.7rem; letter-spacing: 2px; cursor: pointer; }

/* COLLECTION MOBILE */
.collection-view-mobile { padding: 40px 20px; }
.section-head { margin-bottom: 40px; }
.head-title { font-family: 'Chomsky', serif; font-size: 2.5rem; margin-bottom: 5px; }
.head-stats { font-size: 0.7rem; color: #555; letter-spacing: 1px; }

.asset-list-vertical { display: flex; flex-direction: column; gap: 30px; }
.asset-card-v { background: #050505; border: 1px solid #111; overflow: hidden; }
.card-preview { aspect-ratio: 16/9; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.preview-canvas-v { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
.card-meta { padding: 20px; }
.card-uid { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: #333; }
.card-name { font-size: 1rem; font-weight: 400; margin: 5px 0 15px 0; }
.card-badges { display: flex; gap: 8px; }
.badge-v { border: 1px solid #222; font-size: 0.5rem; padding: 2px 8px; color: #555; }
.badge-v.verified { color: #888; border-color: #444; }

/* ANIMATIONS */
.animate-fade-in { animation: fadeIn 1.5s; }
.animate-fade-in-quick { animation: fadeIn 0.6s; }
.animate-slide-up { animation: slideUp 0.8s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

</style>
