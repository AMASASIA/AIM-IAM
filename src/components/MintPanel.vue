<template>
  <div class="mint-panel">
    <div class="status-bar">
      <span>Energy: {{ engineEnergy.toFixed(2) }}</span>
      <span>Status: {{ status }}</span>
    </div>

    <div class="glow-frame" :class="glowClass">
        <!-- Visualization area handled by Antigravity in background or here -->
        <h2 class="title">AIM3 Atomic Mint</h2>
    </div>

    <!-- AI Control Section -->
    <div class="ai-control">
      <h3>AI Guidance</h3>
      <input v-model="aiPrompt" placeholder="Enter prompt e.g. 'Excited space energy'" class="ai-input" />
      <button @click="generateAI" :disabled="loading">
        {{ loading ? 'Analyzing...' : '1. Ask AI' }}
      </button>
    </div>

    <!-- Wallet Connection -->
    <div class="wallet-section" style="margin-bottom: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
       <button v-if="!isWalletConnected" @click="connectWallet" class="wallet-btn">Connect Wallet</button>
       <button v-if="!isWalletConnected" @click="connectBase" class="wallet-btn base-btn">Base Mainnet</button>
       <button v-if="!isWalletConnected" @click="connectBaseSepolia" class="wallet-btn testnet-btn">Base Sepolia</button>
       <div v-else class="wallet-info">Connected: {{ address.substring(0,6) }}...</div>
    </div>

    <!-- Metadata Preview -->
    <div v-if="aiResult" class="metadata-preview">
       <pre>{{ JSON.stringify(aiResult, null, 2) }}</pre>
    </div>

    <!-- Atomic Mint Button -->
    <button class="mint-btn" @click="atomicMint" :disabled="!aiResult || minting">
       {{ minting ? 'Minting Atomic...' : '2. ATOMIC MINT (NFT + SBT + Rally)' }}
    </button>
    
    <div v-if="txHash" class="success-msg">
        Success! <br>
        NFT: {{ txHash.nft }} <br>
        Soul: {{ txHash.sbt }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { askGemini } from "../engine/ai.js";
import { AntigravityEngine } from "../engine/antigravity-engine.js";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const aiPrompt = ref("Energetic neon cyber future");
const loading = ref(false);
const minting = ref(false);
const aiResult = ref(null);
const status = ref("Idle");
const txHash = ref(null);
const engineEnergy = ref(0.5);

const glowClass = computed(() => AntigravityEngine.glowState || 'stable');

const address = ref("0xUserAddressMock");
    const isWalletConnected = ref(false);

    async function connectWallet() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address.value = accounts[0];
          isWalletConnected.value = true;
          status.value = "Wallet Connected: " + address.value.substring(0,6) + "...";
        } catch (error) {
          console.error(error);
          status.value = "Wallet Connection Failed";
        }
      } else {
        status.value = "MetaMask not found!";
      }
    }

    async function connectBase() {
      if (!window.ethereum) return;
      
      try {
        // 1. Connect
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address.value = accounts[0];
        isWalletConnected.value = true;

        // 2. Switch to Base (Chain ID 8453 = 0x2105)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], 
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x2105',
                  chainName: 'Base',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
        status.value = "Connected to Base: " + address.value.substring(0,6) + "...";
      } catch (error) {
        console.error(error);
        status.value = "Base Connection Failed";
      }
    }

    async function connectBaseSepolia() {
      if (!window.ethereum) return;
      
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        address.value = accounts[0];
        isWalletConnected.value = true;

        // Base Sepolia (Chain ID 84532 = 0x14a34)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], 
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x14a34',
                  chainName: 'Base Sepolia Testnet',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
        status.value = "Connected to Base Sepolia: " + address.value.substring(0,6) + "...";
      } catch (error) {
        console.error(error);
        status.value = "Testnet Connection Failed";
      }
    }

    // 1. Generate AI State & Metadata
    async function generateAI() {
  loading.value = true;
  status.value = "Consulting AI...";
  
  try {
    // Prompt 1: Engine Physics
    const enginePrompt = `Analyze this mood: '${aiPrompt.value}'. Return JSON: { "color": "bright|calm|danger|#hex", "gravity": {"x":number,"y":number}, "energyScore": number(0-1), "reactivity": number(0-2) }`;
    const engineConfig = await askGemini(enginePrompt, apiKey);
    
    // Load into Engine
    AntigravityEngine.loadAIState(engineConfig);
    engineEnergy.value = engineConfig.energyScore || 0.5;
    
    // Prompt 2: NFT Metadata
    const metaPrompt = `Generate NFT metadata for '${aiPrompt.value}'. JSON: { "name": string, "description": string, "attributes": [] }`;
    const metadata = await askGemini(metaPrompt, apiKey);
    
    // Combine for Minting
    aiResult.value = {
        engine: engineConfig,
        metadata: metadata
    };
    
    status.value = "AI Ready. Engine Synced.";
  } catch (e) {
    console.error(e);
    status.value = "AI Error";
  } finally {
    loading.value = false;
  }
}

// 2. Atomic Mint Call
async function atomicMint() {
    if(!aiResult.value) return;
    minting.value = true;
    status.value = "Minting on Blockchain...";

    try {
        const metadata = aiResult.value.metadata;
        const aiLog = aiResult.value.engine;
        
        // Auto-detect backend URL (relative path works for Vercel/same-domain)
        const API_URL = ""; 
        
        const res = await fetch(`${API_URL}/atomicMint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: address, // In reality, current connected wallet
                metadata: metadata,
                rally: { stamps: 1, action: "mint" }, // Mock rally update
                aiLog: aiLog
            })
        });
        
        const data = await res.json();
        
        if(data.success) {
            txHash.value = { nft: data.nft.tx, sbt: data.soul.tx };
            status.value = "MINT COMPLETE!";
            AntigravityEngine.triggerMintCelebration();
        } else {
            status.value = "Mint Failed: " + data.error;
        }

    } catch (e) {
        console.error(e);
        status.value = "Network Error";
    } finally {
        minting.value = false;
    }
}

// Loop to update local reactive vars from Engine if needed
setInterval(() => {
    engineEnergy.value = AntigravityEngine.energy;
}, 100);

</script>

<style scoped>
.mint-panel {
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #333;
    max-width: 400px;
    font-family: 'Inter', sans-serif;
}
.glow-frame {
    border: 2px solid #555;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    transition: box-shadow 0.5s;
}
.glow-frame.reactive {
    box-shadow: 0 0 20px var(--glow-color, cyan);
    border-color: white;
}
.ai-input {
    width: 100%;
    padding: 8px;
    background: #222;
    border: 1px solid #444;
    color: white;
    margin-bottom: 10px;
}
button {
    width: 100%;
    padding: 10px;
    cursor: pointer;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    margin-bottom: 10px;
}
button:disabled {
    background: #444;
    cursor: not-allowed;
}
.mint-btn {
    background: linear-gradient(45deg, #ff00cc, #3333ff);
    font-weight: bold;
}
.success-msg {
    color: #00ff00;
    margin-top: 10px;
    word-break: break-all;
    font-size: 0.8em;
}
.base-btn {
    background: #0052FF; /* Coinbase Blue */
}
.base-btn:hover {
    background: #0045d8;
}
.testnet-btn {
    background: #8a2be2; /* Violet for Testnet */
}
.testnet-btn:hover {
    background: #7a1fd2;
}
</style>
