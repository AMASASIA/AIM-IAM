const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with server-side API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const INTENT_ROUTER_INSTRUCTION = `Analyze user intent for AIM3/Antigravity. 
Intents: [CONNECT_VIDEO, MINT_FACT, RECALL_WILL, TODO_TASK]. 
If 'record', 'mint', 'fact' or '証明' is mentioned, use MINT_FACT.`;

/**
 * AIM3 Intent Analysis API
 * Routes intent interpretation through Gemini 2.0 Flash
 */
router.post('/intent', async (req, res) => {
    const { userInput, text, imageBase64, sessionId } = req.body;
    const input = userInput || text || "";

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: INTENT_ROUTER_INSTRUCTION,
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
            }
        });

        console.log(`[AIM3 Backend] Analyzing Intent: "${input.substring(0, 30)}..."`);

        const prompt = `Analyze the following input and extract intent: ${input}`;

        const parts = [prompt];
        if (imageBase64) {
            parts.push({
                inlineData: {
                    data: imageBase64.split(',')[1] || imageBase64,
                    mimeType: "image/jpeg"
                }
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        let intentData;

        try {
            let textResponse = response.text();
            // Clean markdown blocks
            textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            intentData = JSON.parse(textResponse);
        } catch (e) {
            console.error("JSON Parse Error from Gemini:", e);
            intentData = { intent: 'NOTEBOOK_MEMO', message: input, confidence: 0.5 };
        }

        // If MINT_FACT, route to Opal Reasoning Engine
        if (intentData.intent === 'MINT_FACT' && process.env.OPAL_WEBHOOK_URL) {
            console.log('[AIM3] Routing MINT_FACT to Opal...');
            try {
                fetch(process.env.OPAL_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: input,
                        image: imageBase64, // Multimodal visual data
                        sessionId: sessionId || 'default',
                        context: intentData.details
                    })
                }).catch(e => console.error('[AIM3] Opal fetch error:', e));
            } catch (e) {
                console.error('[AIM3] Opal trigger failed:', e);
            }
        }

        res.json(intentData);

    } catch (error) {
        console.error('Intent Router Error:', error);
        res.status(500).json({ error: "AI解析エラー（制限の可能性があります）" });
    }
});

module.exports = router;
