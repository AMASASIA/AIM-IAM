<template>
  <div class="amane-container p-4 md:p-12 w-full h-full flex justify-center items-center font-serif text-[#1A1A1A]">
    <!-- Card Container -->
    <div class="oke-card relative w-full max-w-[340px] bg-[#F2F2F2] rounded-[32px] shadow-2xl overflow-hidden flex flex-col items-center">
      
      <!-- Inner Border Container -->
      <div class="absolute inset-2 border border-black/5 rounded-[24px] pointer-events-none"></div>

      <!-- Brown Header -->
      <div class="w-[85%] mt-8 bg-[#6B5B54] py-3 px-6 text-center shadow-lg">
        <h1 class="text-white text-[13px] font-serif uppercase tracking-[0.1em]">OKE Certified Fact</h1>
      </div>

      <!-- Content Body -->
      <div class="flex-1 w-full px-8 pt-8 pb-10 flex flex-col items-center text-center">
        
        <!-- Logo & Date Section -->
        <div class="flex items-start gap-4 mb-8 w-full justify-center border-b border-[#6B5B54]/20 pb-6">
            <!-- Dynamic OKE Monogram -->
            <div class="w-12 h-12 relative">
                <span class="absolute text-4xl font-serif text-[#C4A484] -top-1 -left-1">K</span>
                <span class="absolute text-5xl font-serif text-[#8B4513] -top-2 left-3 opacity-80">O</span>
                <span class="absolute text-4xl font-serif text-[#C4A484] top-3 left-3">E</span>
            </div>
            
            <div class="text-left">
                <div class="text-[14px] font-bold text-[#1A1A1A] font-serif tracking-tight">OKE Certified</div>
                <div class="text-[9px] text-[#6B5B54] uppercase tracking-wide">Ground Truth Verified</div>
                <div class="text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest mt-1">FEB 4 2026</div>
            </div>
        </div>

        <!-- Grade Score -->
        <div class="mb-8 relative w-full text-left pl-4">
             <div class="flex items-baseline">
                <span class="text-7xl font-serif text-[#1A1A1A] leading-none">{{ fact.grade }}</span>
                <span class="text-lg text-[#1A1A1A]/40 font-serif ml-2">/10.0</span>
             </div>
        </div>

        <!-- Item Details -->
        <div class="w-full text-left space-y-2 mb-8">
            <div class="text-[9px] font-bold uppercase tracking-wide text-[#1A1A1A]/80 leading-relaxed">
                ITEM: {{ fact.model }}
            </div>
            <div class="text-[8px] uppercase tracking-widest text-[#6B5B54]">
                AUTHENTIC ATOMIC FACT
            </div>
            <div class="text-[8px] uppercase tracking-widest text-[#1A1A1A]/60">
                OBSERVER: AMAS Node OS-001
            </div>
            
            <div class="flex items-center justify-between pt-2">
                <span class="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40">HASH: [Shortned, {{ fact.shortId }}...]</span>
                <div class="flex gap-2">
                    <span class="text-[8px]">🔖</span>
                    <span class="text-[8px]">❤</span>
                </div>
            </div>
            
            <!-- Tag -->
             <div class="flex justify-end mt-1">
                 <span class="bg-pink-100 text-pink-500 text-[7px] px-1 py-0.5">❤amas @ <span class="font-bold underline decoration-pink-300">@kamale</span></span>
             </div>
        </div>

        <!-- Button -->
        <a :href="'https://amane.li/' + fact.shortId" class="w-full bg-[#4A5056] text-white py-3 text-[11px] font-serif uppercase tracking-widest shadow-lg hover:bg-[#3A4046] transition-colors">
            View Full Provenance
        </a>

      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  fact: {
    type: Object,
    default: () => ({
      model: "Nike AJ1 High '85",
      grade: 9.8,
      hash: "6ac3f2d1e4a5b6c7d8e9f0a1b2c3d4e5",
      shortId: "6ac3f2d1"
    })
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', serif;
}

.oke-card {
  box-shadow: 
    0 20px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 0 100px rgba(255, 255, 255, 0.2);
}
</style>
