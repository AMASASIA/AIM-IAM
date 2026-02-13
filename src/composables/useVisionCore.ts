import { ref } from 'vue';
import { analyzeImage } from '../services/geminiService.js';
import { processAssetToGateway } from '../services/assetService.js';
import { useNotifications } from './useNotifications.js';

export function useVisionCore() {
    const isAnalyzing = ref(false);
    const analysisResult = ref(null);
    const { notify } = useNotifications();

    const processVisualImport = async (file: File) => {
        isAnalyzing.value = true;
        try {
            const reader = new FileReader();

            const fullBase64 = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const base64 = fullBase64.split(',')[1];

            // Visual Feedback for "Active Resonance"
            notify('Antigravity Vision', 'Absorbing visual semantics...', 'info');

            // Parallel execution: AI Analysis + Gateway Certification
            const [aiResult, gatewayResult] = await Promise.all([
                analyzeImage(base64, file.type),
                processAssetToGateway(file, "Manual Import via Antigravity")
            ]);

            // Construct the data-rich entry
            const entry = {
                id: Date.now().toString(),
                type: 'visual_diary',
                title: `Visual Diary: ${file.name}`,
                content: aiResult.notebookContent || "Visual data captured.",
                timestamp: new Date(),
                metadata: {
                    image: fullBase64,
                    certification_id: gatewayResult?.certification_id,
                    oke_facts: gatewayResult?.atomic_facts,
                    gravity_nodes: aiResult.gravityNodes || [],
                    aura_color: aiResult.auraColor || '#FFFFFF'
                }
            };

            analysisResult.value = entry;

            notify('Gravity Shift', `Topology updated. ${aiResult.gravityNodes?.length || 0} nodes added.`, 'success');

            return entry;

        } catch (error) {
            console.error('Vision Core Error:', error);
            notify('Vision Error', 'Failed to process visual asset.', 'error');
            throw error; // Re-throw to allow component to handle if needed
        } finally {
            isAnalyzing.value = false;
        }
    };

    return {
        isAnalyzing,
        analysisResult,
        processVisualImport
    };
}
