
export const useAmasAudio = () => {
    const createAudioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

    const playSanctuaryBell = () => {
        const audioCtx = createAudioCtx();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // E7 (Pure crystal bell)
        oscillator.frequency.setValueAtTime(2637.02, audioCtx.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.8);

        oscillator.connect(gainNode).connect(audioCtx.destination);
        if (audioCtx.state === 'suspended') audioCtx.resume();
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 3.0);
    };

    const playSemanticTone = (type: 'task' | 'reflection' | 'success' | 'error') => {
        const audioCtx = createAudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        switch (type) {
            case 'task': // High Clear Ping
                osc.frequency.setValueAtTime(1760, audioCtx.currentTime);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                break;
            case 'reflection': // Deep Resonant "Poon"
                osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
                break;
            case 'success': // Gentle uplift
                osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                break;
            case 'error': // Soft warning buzz
                osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                break;
        }

        osc.connect(gain).connect(audioCtx.destination);
        if (audioCtx.state === 'suspended') audioCtx.resume();
        osc.start();
        osc.stop(audioCtx.currentTime + 2.0);
    };

    return { playSanctuaryBell, playSemanticTone };
};
