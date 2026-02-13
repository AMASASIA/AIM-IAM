
export const useAmasAudio = () => {
    const playSanctuaryBell = () => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // 周波数設定：E7（清澄な鈴の音）
        oscillator.frequency.setValueAtTime(2637.02, audioCtx.currentTime);
        oscillator.type = 'sine';

        // エンベロープ設計：認知を妨げない柔らかな減衰（指数関数的ディケイ）
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.8);

        oscillator.connect(gainNode).connect(audioCtx.destination);

        // Ensure context is running (needed if triggered without direct user interaction previously)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(e => console.warn('Audio context resume failed:', e));
        }

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 3.0);
    };

    return { playSanctuaryBell };
};
