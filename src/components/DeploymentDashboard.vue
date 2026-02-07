<template>
  <div class="deployment-container">
    <header>
      <h1>OPAL Deployment Generator</h1>
      <p>1-Click Landing Page Assembly</p>
    </header>

    <div class="workflow-input">
      <div class="input-group">
        <label>Atomic Facts (JSON)</label>
        <textarea v-model="atomicFactsJson" placeholder='{"projectName": "Zephyr", "mission": "Sustain speed", "tech": "Rust, Wasm"}'></textarea>
      </div>
      <div class="input-group">
        <label>Labels (Comma separated)</label>
        <input v-model="labelsInput" placeholder="Web3, High Performance, Cloud" />
      </div>
      <button @click="generateDashboard" :disabled="loading">
        <span v-if="loading">Generating...</span>
        <span v-else>Generate Deployment Dashboard</span>
      </button>
    </div>

    <!-- MINT Process Visualization -->
    <div v-if="loading || generated" class="mint-viz">
      <div class="step" :class="{ done: traceStep('synthesis') }">Synthesize Context</div>
      <div class="line"></div>
      <div class="step" :class="{ done: traceStep('media_gen') }">Generate Media</div>
      <div class="line"></div>
      <div class="step" :class="{ done: traceStep('assembly') }">Assemble Code</div>
    </div>

    <!-- Generated Output Preview -->
    <div v-if="generated" class="output-preview">
      <h2>Generated Dashboard Preview</h2>
      <div class="iframe-mockup">
        <div v-html="output.html"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const atomicFactsJson = ref('{\n  "projectName": "Nimbus Cloud",\n  "tagline": "Serverless at the Edge",\n  "description": "Deploy instances in milliseconds across 50 regions.",\n  "features": ["Global Low Latency", "Instant Scaling", "Pay per Millisecond"]\n}');
const labelsInput = ref('Cloud, Edge Computing, DevOps');
const loading = ref(false);
const generated = ref(false);
const output = ref(null);
const trace = ref([]);

const generateDashboard = async () => {
  try {
    loading.value = true;
    generated.value = false;
    trace.value = [];

    const facts = JSON.parse(atomicFactsJson.value);
    const labels = labelsInput.value.split(',').map(s => s.trim());

    const res = await fetch('http://localhost:3000/deployment/generate-dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atomicFacts: facts, labels })
    });

    const data = await res.json();
    if (data.status === 'success') {
      output.value = data.output;
      trace.value = data.trace;
      generated.value = true;
    }

  } catch (e) {
    console.error(e);
    alert('Generation failed. Check console.');
  } finally {
    loading.value = false;
  }
};

const traceStep = (stepName) => {
  if (!trace.value) return false;
  return trace.value.find(t => t.step === stepName && t.status === 'completed');
};
</script>

<style scoped>
.deployment-container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  color: #fff;
  background: #0f172a;
  min-height: 100vh;
}

header h1 {
  background: linear-gradient(to right, #a78bfa, #2dd4bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.workflow-input {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #94a3b8;
}

textarea {
  width: 100%;
  height: 120px;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px;
  font-family: monospace;
}

input {
  width: 100%;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover { background: #2563eb; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.mint-viz {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.step {
  padding: 10px 20px;
  background: #1e293b;
  border-radius: 20px;
  border: 1px solid #334155;
  color: #64748b;
  transition: all 0.3s;
}

.step.done {
  background: #10b981;
  color: #fff;
  border-color: #059669;
}

.line {
  width: 50px;
  height: 2px;
  background: #334155;
}

.output-preview {
  background: #fff;
  color: #1a202c;
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
}

.output-preview h2 {
  color: #000;
  margin-bottom: 20px;
}

.iframe-mockup {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
