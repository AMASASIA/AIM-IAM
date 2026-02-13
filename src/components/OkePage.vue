<template>
  <div class="oke-container">
    
    <!-- AUTH VIEW: Identity Nexus -->
    <div v-if="viewState === 'login'" class="auth-wrapper">
      <div class="auth-content">
        <h1 class="auth-title font-serif-luxury text-6xl">OKE</h1>
        
        <div class="input-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Enter your email" 
            class="auth-input"
            @keyup.enter="handleLogin"
          />
          <div class="input-icon">✉️</div>
          <button class="email-login-btn" @click="handleLogin" v-if="email">→</button>
        </div>

        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Wallet Connect (Gray Button) -->
        <button class="wallet-btn" @click="handleLogin">
          A\WALLET
        </button>

        <!-- Narrative Link (Bottom) -->
        <div class="footer-link">
          <a href="#" @click.prevent="handleLogin">Narrative</a>
        </div>
      </div>
    </div>

    <!-- APP VIEW: Atomic Mint Dashboard -->
    <div v-else class="app-wrapper">
      <div class="header">
        <div class="brand font-serif-luxury">OKE <span class="text-xs ml-2 tracking-widest font-sans opacity-60">ATOMIC MINT</span></div>
        <div class="nav-tabs">
          <button :class="{ active: currentTab === 'generate' }" @click="currentTab = 'generate'">GENERATE</button>
          <button :class="{ active: currentTab === 'treasury' }" @click="currentTab = 'treasury'">VAULT</button>
          <button :class="{ active: currentTab === 'collection' }" @click="currentTab = 'collection'">MY COLLECTION</button>
        </div>
        <button class="logout-btn" @click="viewState = 'login'">Exit</button>
      </div>

      <!-- TAB: GENERATE OKE -->
      <div v-if="currentTab === 'generate'" class="generate-view animate-fade-in-up">
        <h2 class="section-title">Generate OKE</h2>
        
        <div class="upload-area">
          <div class="preview-box">
            <canvas ref="kaleidoscopeCanvas" width="120" height="120" class="kaleidoscope-canvas"></canvas>
          </div>
          
          <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none;">
          <button class="action-btn" @click="triggerFileUpload">
            {{ selectedFile ? selectedFile.name : 'Change File' }}
          </button>
          
          <button class="action-btn" :class="{ recording: isRecording }" @click="toggleVoiceInput">
            {{ isRecording ? 'Listening...' : 'Add Voice Input' }}
          </button>
        </div>

        <div class="mint-options">
          <p class="options-title">Options</p>
          <label class="checkbox-row">
            <input type="checkbox" checked>
            <span class="checkmark"></span>
            <div class="label-text">
              <span class="main">Mint as NFT + SBT</span>
            </div>
          </label>
          
          <label class="checkbox-row">
            <input type="checkbox" checked>
            <span class="checkmark"></span>
            <div class="label-text">
              <span class="main">Create TBA Wallet</span>
            </div>
          </label>
          
          <p class="helper-text">
            This will create a Soul-bound token tied to your identity and a Token-Bound Account for this OKE.
          </p>
        </div>

        <button class="mint-btn" @click="executeAtomicMint" :disabled="minting">
          <span v-if="minting">INVOKING RITUAL...</span>
          <span v-else>Atomic Mint</span>
        </button>
        
        <div v-if="mintStatus" class="status-log">{{ mintStatus }}</div>
      </div>

      <!-- TAB: VAULT DASHBOARD -->
      <div v-if="currentTab === 'treasury'" class="treasury-view animate-fade-in-up">
        <h2 class="section-title">Vault Dashboard</h2>
        <div v-if="!selectedTreasury" class="grid-layout">
          <div v-for="t in treasuries" :key="t.id" class="treasury-card">
            <div class="card-header">
              <h3>Treasury {{ t.id }}</h3>
            </div>
            <div class="card-body">
              <p><strong>Address:</strong> {{ t.address }}</p>
              <p><strong>Balance:</strong> {{ t.balance }} ETH</p>
              <p><strong>Members:</strong> {{ t.members }}</p>
            </div>
            <div class="card-footer">
              <button class="open-btn" @click="selectedTreasury = t">Open</button>
            </div>
          </div>
        </div>
        
        <div v-else class="detail-view">
          <div class="detail-header">
            <button class="back-btn" @click="selectedTreasury = null">← Back</button>
            <h2>Treasury {{ selectedTreasury.id }} Details</h2>
          </div>
          
          <div class="detail-grid">
            <div class="panel">
              <h3>Owners</h3>
              <div class="owner-row">Alice (You)</div>
              <div class="owner-row">Bob</div>
              <div class="owner-row">Carol</div>
            </div>
            
            <div class="panel">
              <h3>Pending Proposals</h3>
              <div class="proposal-item">Transfer 10 ETH to 0x123...</div>
              <div class="proposal-item">Add new owner: Dave</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: MY COLLECTION -->
      <div v-if="currentTab === 'collection'" class="collection-view animate-fade-in-up">
        <div class="collection-grid">
          <div v-for="item in collectionItems" :key="item.id" class="oke-card">
            <div class="card-visual-area">
              <canvas :id="`canvas-${item.id}`" width="280" height="280" class="item-canvas"></canvas>
            </div>
            <div class="card-info">
              <div class="card-id">{{ item.id }}</div>
              <h3 class="card-title">{{ item.name }}</h3>
              <span class="card-type-badge">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RITUAL OVERLAY: DIVINE FORGE -->
      <div v-if="minting" class="divine-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <canvas id="ritual-canvas" width="800" height="800" class="ritual-canvas"></canvas>
        <div class="ritual-content">
          <h2 class="ritual-title">ATOMIC MINT</h2>
          <p class="ritual-subtitle">ALIGNING DIGITAL CONSTELLATIONS</p>
          <div class="ritual-loader"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const viewState = ref('login');
const email = ref('');
const currentTab = ref('generate');
const minting = ref(false);
const mintStatus = ref('');
const selectedTreasury = ref(null);
const kaleidoscopeCanvas = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const isRecording = ref(false);
const previewSeed = ref(1.0);

const triggerFileUpload = () => fileInput.value?.click();
const handleFileSelect = (e) => {
    if (e.target.files[0]) {
        selectedFile.value = e.target.files[0];
        previewSeed.value = (e.target.files[0].lastModified % 5) + 2; 
    }
};
const toggleVoiceInput = () => isRecording.value = !isRecording.value;
const collectionItems = ref([
  { id: 'OKE-001-FIB', name: 'Golden Spiral', type: 'NFT', seed: 1.2 },
  { id: 'OKE-002-LOG', name: 'Logarithmic', type: 'SBT', seed: 0.8 },
  { id: 'OKE-003-VOID', name: 'Void Singularity', type: 'TBA', seed: 1.5 }
]);

const treasuries = ref([
    { id: 'A', address: '0xAbCd...097', balance: '1200.00', members: 3 },
    { id: 'B', address: '0xAbCd...197', balance: '1237.00', members: 3 },
    { id: 'C', address: '0xAbCd...297', balance: '1274.00', members: 3 },
    { id: 'D', address: '0xAbCd...397', balance: '1311.00', members: 3 },
    { id: 'E', address: '0xAbCd...497', balance: '1348.00', members: 3 },
    { id: 'F', address: '0xAbCd...597', balance: '1385.00', members: 3 },
]);

// Actions
const handleLogin = () => {
  viewState.value = 'app';
};

// CK Logic: Luxury Fibonacci Kaleidoscope
const drawFibonacciKaleidoscope = (ctx, config) => {
  const phi = 1.61803398875;
  const { symmetry, color, lineWeight } = config;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWeight;
  
  ctx.shadowBlur = 4;
  ctx.shadowColor = color; 

  for (let i = 0; i < symmetry; i++) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((Math.PI * 2 / symmetry) * i);
    
    ctx.beginPath();

    let r = 2;
    let prevX = r; 
    let prevY = 0;
    
    const k = Math.log(phi) / (Math.PI / 2);

    for (let theta = 0; theta < Math.PI * 4; theta += 0.05) {
      const currentR = r * Math.exp(k * theta);
      
      const x = currentR * Math.cos(theta);
      const y = currentR * Math.sin(theta);
      
      if (currentR > maxRadius * 0.8) break;

      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      
      prevX = x;
      prevY = y;
    }
    ctx.stroke();
    ctx.restore();
  }
};

const executeAtomicMint = async () => {
    if (minting.value) return;
    minting.value = true;
    
    console.log("MINTING SEQUENCE INITIATED");

    const ritualPromise = new Promise(resolve => setTimeout(resolve, 4000));
    
    try {
        const fetchPromise = fetch('http://localhost:3000/atomicMint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: '0xUserWalletAddress', 
                metadata: {
                    name: 'OKE GENESIS',
                    description: 'Generated via OKE Atomic Interface',
                    location: 'Tokyo/Digital'
                },
                rally: { status: 'active' },
                aiLog: { energyScore: 0.98 }
            })
        })
        .then(r => r.json())
        .catch(() => ({ 
            success: true, 
            forcedMock: true,
            transaction: { tx: '0xSIMULATED_TX_HASH_' + Date.now() },
            ipfs: { url: 'ipfs://QmSimulatedHash' } 
        }));

        const [_, data] = await Promise.all([ritualPromise, fetchPromise]);
        
        if (data.success) {
             console.log("MINT SUCCESS", data);
             mintStatus.value = `Success! TX: ${data.transaction.tx.substring(0, 10)}...`;
             
             const newId = `OKE-${Math.floor(Math.random()*9000)+1000}-GEN`;
             const newCard = {
                id: newId,
                name: 'Atomic Genesis',
                type: 'ATOMIC',
                seed: isRecording.value ? previewSeed.value + 0.5 : previewSeed.value + Math.random()
             };
             
             collectionItems.value = [newCard, ...collectionItems.value];
             
             currentTab.value = 'collection';
        }

    } catch (e) {
        console.error("Critical Mint Error:", e);
    } finally {
        minting.value = false;
    }
};

onMounted(async () => {
    try {
        const res = await fetch('http://localhost:3000/atomicMint/pins').catch(()=>null);
        if (res && res.ok) {
            const pins = await res.json();
            if (Array.isArray(pins)) {
                pins.forEach(pin => {
                     if (!collectionItems.value.find(i => i.id === pin.tx)) {
                         collectionItems.value.push({
                            id: pin.tx ? pin.tx.substring(0,8) : 'LEGACY',
                            name: 'Ledger Asset',
                            type: 'CHAIN',
                            seed: pin.energy ? Number(pin.energy) + 1 : 1.5
                         });
                     }
                });
            }
        }
    } catch(e) { console.log("Persistence skip"); }

    const animate = () => {
        const time = Date.now() * 0.0005;

        if (minting.value) {
             const ritualEl = document.getElementById('ritual-canvas');
             if (ritualEl) {
                 const ctx = ritualEl.getContext('2d');
                 ctx.clearRect(0,0, ritualEl.width, ritualEl.height);
                 
                 const g = ctx.createRadialGradient(400,400, 10, 400,400, 600);
                 g.addColorStop(0, '#222'); g.addColorStop(1, '#000');
                 ctx.fillStyle = g; ctx.fillRect(0,0,800,800);
                 
                 ctx.save();
                 ctx.translate(400,400);
                 ctx.rotate(time * 3.0);
                 ctx.translate(-400,-400);
                 if (typeof drawFibonacciKaleidoscope === 'function') {
                    drawFibonacciKaleidoscope(ctx, { symmetry: 24, color: '#D4AF37', lineWeight: 1.5 });
                 }
                 ctx.restore();
             }
        }

        else if (kaleidoscopeCanvas.value && currentTab.value === 'generate') {
             const currentSeed = isRecording.value ? previewSeed.value + Math.sin(time * 10) * 0.5 : previewSeed.value;
             renderKaleidoscope(kaleidoscopeCanvas.value, time, currentSeed);
        }

        else if (currentTab.value === 'collection') {
             collectionItems.value.forEach(item => {
                 const el = document.getElementById(`canvas-${item.id}`);
                 if (el) renderKaleidoscope(el, time, item.seed);
             });
        }
        
        requestAnimationFrame(animate);
    };

    const renderKaleidoscope = (canvas, time, seed) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const gradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width/2);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.rotate(time * 0.2 * Math.sqrt(seed)); 
        ctx.translate(-width/2, -height/2);

        if (typeof drawFibonacciKaleidoscope === 'function') {
            drawFibonacciKaleidoscope(ctx, {
                symmetry: Math.floor(12 * seed) || 6, 
                color: '#D4AF37',
                lineWeight: 0.8
            });
        }
        
        ctx.restore();
    };

    animate();
});

</script>

<style scoped>
.checkbox-row input {
  display: none !important;
}


.kaleidoscope-canvas {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}


/* RITUAL OVERLAY CSS - DIVINE FORGE */
.divine-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #D4AF37;
    animation: fadeIn 0.5s ease-out;
}

.ritual-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.6;
    pointer-events: none;
}

.ritual-content {
    position: relative;
    z-index: 10;
    text-align: center;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    padding: 60px;
    border-radius: 50%;
    border: 1px solid rgba(212, 175, 55, 0.4);
    box-shadow: 0 0 50px rgba(212, 175, 55, 0.2);
}

.ritual-title {
    font-size: 3rem;
    font-family: 'Times New Roman', serif;
    letter-spacing: 8px;
    margin-bottom: 12px;
    animation: pulseGlow 2s infinite ease-in-out;
    text-transform: uppercase;
}

.ritual-subtitle {
    font-size: 0.9rem;
    letter-spacing: 4px;
    color: #aaa;
    font-family: 'Courier New', monospace;
}

.ritual-loader {
    width: 60px;
    height: 2px;
    background: #D4AF37;
    margin: 30px auto 0;
    animation: expandWidth 2s infinite ease-in-out;
}

@keyframes pulseGlow {
    0% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.2); opacity: 0.8; }
    50% { text-shadow: 0 0 40px rgba(212, 175, 55, 0.8), 0 0 20px #fff; opacity: 1; scale: 1.05; }
    100% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.2); opacity: 0.8; }
}

@keyframes expandWidth {
    0% { width: 0; opacity: 0; }
    50% { width: 100px; opacity: 1; }
    100% { width: 0; opacity: 0; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* OKE CARD COLLECTION DESIGN */
.collection-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 32px;
  padding: 40px 0;
}

.oke-card {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(10, 10, 10, 1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.oke-card:hover {
  transform: translateY(-12px) scale(1.02);
  border-color: rgba(212, 175, 55, 0.8);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.15);
}

.card-visual-area {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.item-canvas {
    width: 100%;
    height: 100%;
}

.card-info {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.card-id {
  color: #D4AF37;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.card-title {
  color: #fff;
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  font-weight: 300;
}

.card-type-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: 0.5px solid #D4AF37;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.oke-container {
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* AUTH STYLES */
.auth-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.auth-content {
  width: 100%;
  max-width: 320px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-title {
  margin-bottom: 20px;
}

.input-group {
  position: relative;
  width: 100%;
}

.auth-input {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #ccc;
  padding: 12px 60px 12px 15px;
  border-radius: 6px;
  outline: none;
  font-size: 0.9rem;
}

.auth-input:focus { border-color: #555; }

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.email-login-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: white;
  border: 1px solid #333;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.email-login-btn:hover { background: #333; }

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 0.75rem;
  margin: 10px 0;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #333;
  margin: 0 10px;
}

.wallet-btn {
  background: #4b5563;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.wallet-btn:hover { background: #374151; }

.footer-link { margin-top: 30px; }
.footer-link a {
  color: #888;
  text-decoration: underline;
  font-size: 0.8rem;
  cursor: pointer;
}

/* APP STYLES */
.app-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #000;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #222;
  margin-bottom: 30px;
}

.brand { font-size: 1.5rem; }

.nav-tabs {
    display: flex;
    gap: 20px;
}

.nav-tabs button {
    background: none;
    border: none;
    color: #666;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.9rem;
    padding-bottom: 5px;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
}

.nav-tabs button.active {
    color: #fff;
    border-bottom: 2px solid #fff;
}

.logout-btn {
  background: none;
  border: 1px solid #333;
  color: #888;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

/* GENERATE VIEW */
.generate-view {
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 300;
    margin-bottom: 20px;
}

.upload-area {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.preview-box {
    width: 120px;
    height: 120px;
    background: #fff;
    border-radius: 12px;
    margin: 0 auto 10px auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.action-btn {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #333;
    background: #111;
    color: #ccc;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.action-btn:hover { background: #222; border-color: #555; }

.action-btn.recording {
    border-color: #ef4444;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}

.mint-options {
    width: 100%;
    background: #000;
    padding: 10px 0;
}

.options-title {
    font-size: 0.9rem;
    color: #888;
    margin-bottom: 15px;
}

.checkbox-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    cursor: pointer;
}

.checkbox-row input {
    display: none;
}

.checkmark {
    width: 18px;
    height: 18px;
    background: #2563eb;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkmark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.label-text .main {
    font-size: 0.95rem;
    color: #fff;
}

.helper-text {
    font-size: 0.7rem;
    color: #555;
    margin-top: 10px;
    line-height: 1.4;
}

.mint-btn {
    width: 100%;
    padding: 14px;
    background: #10b981;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 10px;
}

.mint-btn:disabled { opacity: 0.7; }

/* TREASURY VIEW */
.treasury-view {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
}

.grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.treasury-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 20px;
}

.card-header h3 {
    margin: 0 0 15px 0;
    font-size: 1rem;
    color: #888;
}

.card-body {
    margin-bottom: 20px;
}

.card-body p {
    margin: 5px 0;
    font-size: 0.9rem;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.open-btn {
    background: transparent;
    border: 1px solid #333;
    color: #ccc;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.open-btn:hover { background: #222; }

/* TREASURY DETAIL */
.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
}

.back-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.panel {
    background: #0a0a0a;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 20px;
}

.panel h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 0.9rem;
    color: #888;
}

.owner-row, .proposal-item {
    padding: 10px;
    background: #111;
    border: 1px solid #222;
    border-radius: 6px;
    margin-bottom: 10px;
}
</style>
