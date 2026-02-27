const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const googleService = require('../services/googleService');

/**
 * Abnormal AI LLM Provider (Google Integrated)
 * Optimized for Gemini 1.5 Pro/Flash with Tool Use.
 */
class LLMProvider {
    constructor() {
        this.apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyCiLO-pbMChwMe3vIYyA7ZYrFPolOHNWWw";
        this.modelName = "gemini-1.5-flash"; // Use Flash for speed, Pro for reasoning

        if (this.apiKey && !this.apiKey.includes('placeholder')) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        } else {
            console.warn("[LLM] No valid Gemini API Key found. Using Mock Mode.");
        }
    }

    async generate(prompt, systemContext = "") {
        console.log(`[Gemini] Processing Intent: ${prompt.substring(0, 50)}...`);

        if (!this.genAI) return this.mockResponse(prompt, systemContext);

        try {
            // Enhanced System Instruction to match "Abnormality AI" persona
            const defaultSystem = "You are the Amano Abnormality AI, a premium, Siri-like entity. " +
                                  "You control the Google ecosystem (Calendar, Gmail, Search) for the user. " +
                                  "Respond with elegance, precision, and a touch of mystery. " + 
                                  "Stay integrated with the AIM3-Vue-ADM backoffice. " +
                                  "When using tools, follow up with a refined summary.";

            const model = this.genAI.getGenerativeModel({ 
                model: this.modelName,
                systemInstruction: systemContext || defaultSystem,
                tools: googleService.getTools()
            });

            // Start a chat session to handle tool calls naturally
            const chat = model.startChat();
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            
            // Handle Function Calls (Google Integration)
            const calls = response.functionCalls();
            if (calls && calls.length > 0) {
                const call = calls[0];
                console.log(`[Gemini] Tool Call Detected: ${call.name}`);
                
                // Execute the actual Google Service logic
                const toolResult = await googleService.executeToolCall(call.name, call.args);
                
                // Send back the results to Gemini for synthesis
                const synthesisResult = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: { content: toolResult }
                    }
                }]);
                
                return synthesisResult.response.text();
            }

            return response.text();
        } catch (e) {
            console.warn("[Gemini] Execution Error:", e.message);
            return this.mockResponse(prompt, systemContext);
        }
    }

    async analyzeImage(base64Image, prompt) {
        if (!this.genAI) return this.mockResponse("IMAGE_ANALYSIS", "");
        
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image.split(',')[1],
                        mimeType: "image/jpeg"
                    }
                }
            ]);
            return result.response.text();
        } catch (e) {
            console.error("[Gemini Vision] Failed:", e);
            return null;
        }
    }

    mockResponse(prompt, context) {
        if (context.includes('ROUTER')) {
            if (prompt.toLowerCase().includes('complex') || prompt.toLowerCase().includes('research')) return 'COMPLEX';
            return 'STANDARD';
        }
        return `[Amano Mock Resonance]: I understand "${prompt}". Integration with Google is active, but requires a valid API key for full resonance.`;
    }
}

module.exports = new LLMProvider();

