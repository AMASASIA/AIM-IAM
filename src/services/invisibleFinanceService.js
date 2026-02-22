/**
 * Invisible Finance Service (Base Layer Integration)
 * 
 * Interface for AI Transaction Gateway (ERC-8004) and Memory Ingestion.
 */

const API_BASE_URL = import.meta.env.VITE_FINANCE_API_URL || 'http://localhost:8000';

export const invisibleFinanceService = {
    /**
     * Start Memory Ingestion (2-finger hold)
     * Effectively triggers a voice stream to the backend for semantic indexing.
     */
    async startMemoryIngest(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob);

        try {
            const response = await fetch(`${API_BASE_URL}/memory/ingest`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Memory Ingest failed:', error);
            return { status: 'error', message: error.message };
        }
    },

    /**
     * Execute Invisible Payment (2-finger swipe)
     * Finalizes the deal on the Base chain using the AI Agent Identity.
     */
    async executePayment(params = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/finance/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: params.amount || 10,
                    recipient: params.recipient || null,
                    reason: params.reason || 'Tive AI Gesture Execution'
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Payment Execution failed:', error);
            return { status: 'error', message: error.message };
        }
    },

    /**
     * Get Layer Status
     */
    async getStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/finance/status`);
            return await response.json();
        } catch (error) {
            return { status: 'offline' };
        }
    }
};

export default invisibleFinanceService;
