const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Centralized AI intent service routing all requests to the backend
export const intentService = {
    /**
     * Main intent analyzer (replaces analyzeIntent from geminiService)
     */
    async analyzeIntent(userInput, imageBase64 = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userInput,
                    imageBase64,
                    sessionId: 'default'
                }),
            });
            if (!response.ok) throw new Error('Backend responded with error');
            return await response.json();
        } catch (error) {
            console.error('AI Intent analysis failed:', error);
            // Fallback for offline/error
            return {
                intent: 'NOTEBOOK_MEMO',
                message: userInput,
                confidence: 0.5,
                details: 'Fallback due to connection error'
            };
        }
    },

    /**
     * General text generation (replaces processVoiceNote, generateSecretNotebook)
     */
    async generateText(prompt, systemContext = "") {
        try {
            const response = await fetch(`${API_BASE_URL}/agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    systemContext: systemContext,
                    sessionId: 'default'
                }),
            });
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Text generation failed:', error);
            return `[Fallback]: ${prompt}`;
        }
    },

    /**
     * Image analysis (replaces analyzeImage, analyzeSemanticDiff)
     */
    async analyzeScene(imageBase64, prompt) {
        try {
            const response = await fetch(`${API_BASE_URL}/analyze-scene`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, prompt })
            });
            return await response.json();
        } catch (error) {
            console.error('Scene analysis failed:', error);
            return null;
        }
    }
};

// Aliases for compatibility during migration
export const analyzeIntent = intentService.analyzeIntent;
export const processVoiceNote = (transcript) => intentService.generateText(transcript, "You are the AMAS Secretary. Refine this transcript into a beautiful Notebook entry.");
export const generateSecretNotebook = (threadsId, igId) => intentService.generateText(`Identity: @${threadsId} / @${igId}. Generate a Secret Notebook entry.`);
export const sendMessage = (chat, message) => intentService.generateText(message);
export const analyzeSemanticDiff = (before, after) => intentService.analyzeScene(after, "Compare with previous state: " + before);
export const analyzeImage = (base64, type) => intentService.analyzeScene(base64, "Analyze this image for Visual Diary entry.");
export const analyzeVisionCommerce = (base64, type) => intentService.analyzeScene(base64, "Detect and analyze products for commerce resonance.");
export const createKernelSession = () => null; // Kernel sessions are now managed server-side
