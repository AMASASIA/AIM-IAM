import { ref } from 'vue';
import { audioStorageService } from '../services/audioStorageService';

export function useAmasAudioRecorder() {
    const isRecording = ref(false);
    const mediaRecorder = ref(null);
    const audioChunks = ref([]);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const lastAudioUrl = ref(null);
    const lastAudioId = ref(null);
    const recordingTimer = ref(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
            }

            mediaRecorder.value = new MediaRecorder(stream, options);
            audioChunks.value = [];
            lastAudioUrl.value = null;
            lastAudioId.value = null;

            mediaRecorder.value.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.value.push(event.data);
                }
            };

            mediaRecorder.value.start();
            isRecording.value = true;
            console.log("[Amas Audio] Recording started...");

            recordingTimer.value = setTimeout(() => {
                if (isRecording.value) {
                    console.log("[Amas Audio] Reached 60s limit, auto-stopping...");
                    stopRecording();
                }
            }, 60000);

        } catch (err) {
            console.error("[Amas Audio] Failed to start recording:", err);
            throw err;
        }
    };

    const stopRecording = () => {
        return new Promise((resolve) => {
            if (recordingTimer.value) {
                clearTimeout(recordingTimer.value);
                recordingTimer.value = null;
            }

            if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
                resolve(null);
                return;
            }

            mediaRecorder.value.onstop = async () => {
                const audioBlob = new Blob(audioChunks.value, { type: mediaRecorder.value.mimeType });
                lastAudioUrl.value = URL.createObjectURL(audioBlob);

                // Persistence: Save to IndexedDB
                const id = `voice-${Date.now()}`;
                try {
                    await audioStorageService.saveAudio(id, audioBlob);
                    lastAudioId.value = id;
                    console.log("[Amas Audio] Saved to persistent storage:", id);
                } catch (e) {
                    console.warn("[Amas Audio] Persistence failed:", e);
                }

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = reader.result;
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                audioBase64: base64data,
                                mimeType: mediaRecorder.value.mimeType
                            })
                        });

                        const data = await response.json();
                        resolve(data.transcript);
                    } catch (e) {
                        console.error("[Amas Audio] Transcription fetch failed:", e);
                        resolve(null);
                    }
                };
                reader.readAsDataURL(audioBlob);

                mediaRecorder.value.stream.getTracks().forEach(track => track.stop());
                isRecording.value = false;
            };

            mediaRecorder.value.stop();
        });
    };

    return {
        isRecording,
        lastAudioUrl,
        lastAudioId,
        startRecording,
        stopRecording
    };
}
