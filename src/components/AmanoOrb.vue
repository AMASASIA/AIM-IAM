<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  isListening: Boolean,
  isProcessing: Boolean,
  intensity: {
    type: Number,
    default: 0
  }
});

const orbText = ref('');
const canvasRef = ref(null);

// Optional: Subtle particle animation inside the orb
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animationFrame;
  let particles = [];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const init = () => {
    canvas.width = 300;
    canvas.height = 300;
    particles = Array.from({ length: 30 }, () => new Particle());
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationFrame = requestAnimationFrame(animate);
  };

  init();
  animate();
});
</script>

<template>
  <div class="orb-container" :class="{ 'is-listening': isListening, 'is-processing': isProcessing }">
    <!-- Outer Glow Ring -->
    <div class="outer-ring"></div>
    
    <!-- The Orb itself -->
    <div class="orb-core">
      <!-- Fog/Mist Layer 1 -->
      <div class="mist layer-1"></div>
      <!-- Fog/Mist Layer 2 -->
      <div class="mist layer-2"></div>
      
      <!-- Internal Particles Canvas -->
      <canvas ref="canvasRef" class="particle-canvas"></canvas>
      
      <!-- Tive Center Dot -->
      <div class="tive-dot"></div>

      <!-- Center Core Light -->
      <div class="core-light"></div>
    </div>

    <!-- UI Feedback Overlay -->
    <div v-if="isListening" class="listening-wave">
      <div v-for="i in 3" :key="i" class="wave"></div>
    </div>
  </div>
</template>

<style scoped>
.orb-container {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.light-mode .orb-container {
  filter: saturate(1.2) contrast(1.1);
}

.outer-ring {
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 60px rgba(255, 255, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
  opacity: 0.6;
  filter: blur(1px);
  animation: ring-pulse 6s infinite ease-in-out;
}

.light-mode .outer-ring {
  border-color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
}

.orb-core {
  position: relative;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 120px rgba(0, 0, 0, 0.9),
              inset 0 0 60px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-mode .orb-core {
  background: radial-gradient(circle at 50% 50%, #ffffff 0%, #e0e0e0 100%);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.05);
}

.tive-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  z-index: 10;
  box-shadow: 0 0 15px white, 0 0 30px white;
  animation: dot-breathe 4s infinite ease-in-out;
}

.light-mode .tive-dot {
  background: black;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
}

@keyframes dot-breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
}

/* Mist/Fog Animations */
.mist {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  border-radius: 40%;
}

.layer-1 {
  animation: mist-float 15s infinite linear;
  opacity: 0.6;
}

.layer-2 {
  animation: mist-float 20s infinite linear reverse;
  opacity: 0.4;
  background: radial-gradient(circle at center, rgba(200, 220, 255, 0.2) 0%, transparent 60%);
}

.core-light {
  position: absolute;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.4;
  animation: core-shimmer 2s infinite ease-in-out;
}

.particle-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.5;
}

/* States */
.is-listening .outer-ring {
  border-color: #fff;
  box-shadow: 0 0 60px rgba(255, 255, 255, 0.8),
              inset 0 0 30px rgba(255, 255, 255, 0.4);
  animation: ring-expand-listening 1.5s infinite ease-out;
}

.is-listening .core-light {
  opacity: 0.8;
  width: 100px;
  height: 100px;
  filter: blur(40px);
}

.is-processing .orb-core {
  animation: orb-vibrate 0.2s infinite;
}

/* Animations */
@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.02); opacity: 0.9; }
}

@keyframes ring-expand-listening {
  0% { transform: scale(1); opacity: 1; border-width: 4px; }
  100% { transform: scale(1.1); opacity: 0.4; border-width: 1px; }
}

@keyframes mist-float {
  0% { transform: translate(-25%, -25%) rotate(0deg); }
  100% { transform: translate(-25%, -25%) rotate(360deg); }
}

@keyframes core-shimmer {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

@keyframes orb-vibrate {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
  100% { transform: translate(1px, 1px); }
}

/* Wave feedback */
.listening-wave {
  position: absolute;
  width: 400px;
  height: 400px;
  pointer-events: none;
}

.wave {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: wave-spread 3s infinite linear;
}

.wave:nth-child(2) { animation-delay: 1s; }
.wave:nth-child(3) { animation-delay: 2s; }

@keyframes wave-spread {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}
</style>
