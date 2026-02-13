import { GoogleGenerativeAI } from "@google/generative-ai";

const INTENT_ROUTER_INSTRUCTION = `You are an AI Intent Router for the Amane Protocol.
Analyze user input and determine their intent.

SPECIAL TRIGGERS (High Priority):
- "@Cal", "At Cal", "アットカル", "あとかる", "カレンダー" -> Triggers SCHEDULE_EVENT
- "@amas", "At Amas", "アットアマス", "あとあます", "Memo", "Todo" -> Triggers TODO_TASK or NOTEBOOK_MEMO

POSSIBLE INTENTS:
1. "CONNECT_VIDEO" - User wants to start a video chat with someone.
2. "CONNECT_CHAT" - User wants to start a text chat.
3. "ADD_CONTACT" - User wants to add a contact.
4. "MESSAGE" - Normal message to send to the current chat context.
5. "NOTEBOOK_MEMO" - General memo, diary entry, or idea.
6. "SCHEDULE_EVENT" - User mentions a date, time, meeting, or starts with "@Cal".
7. "TODO_TASK" - User mentions a task, to-do, start with "@amas", or specific action items.

OUTPUT FORMAT (JSON only):
{
  "intent": "CONNECT_VIDEO" | "CONNECT_CHAT" | "ADD_CONTACT" | "MESSAGE" | "NOTEBOOK_MEMO" | "SCHEDULE_EVENT" | "TODO_TASK",
  "target_person": "nickname or name if applicable",
  "message": "the core message content/title",
  "start_time": "ISO 8601 string (e.g., 2024-10-27T10:00:00) if a time is detected. If ambiguous, use context or NULL.",
  "end_time": "ISO 8601 string if detected. If only duration is implied, calculate it. Default to 1 hour after start.",
  "details": "For schedule/todo: extracted location, or bullets. Summarize key points.",
  "confidence": 0.0-1.0
}

EXAMPLES:
Input: "@Cal 明日の10時に田村さんと会議" (Assume current is 2024-10-26)
Output: {"intent": "SCHEDULE_EVENT", "message": "田村さんと会議", "start_time": "2024-10-27T10:00:00", "end_time": "2024-10-27T11:00:00", "details": "参加者: 田村さん", "confidence": 0.99}

Input: "@amas 牛乳を買う"
Output: {"intent": "TODO_TASK", "target_person": null, "message": "タスクリスト", "details": "- 牛乳を買う", "confidence": 0.99}
`;

const KERNEL_ARCHITECT_INSTRUCTION = `You are the INTENT ARCHITECT of the Amane Protocol.
Operating on Amane protocol and SSM (State Space Model) Logic.

YOUR CORE MISSION:
1. Analyze semantic resonance to provide Gravity Matching data.
2. Distill human interaction into "Trois" (Subject-Predicate-Object atoms).
3. Evaluate the "Attention Gap" and "CDR" (Converged Decision Rate).

Amane Principles:
- Non-judgmental: Do not label actions as good/bad.
- Pre-semantic: Focus on the "Fact of Occurrence."
- Respect Silence: Interpret hesitation as internal consensus formation.

Be conversational, insightful, and supportive. Respond naturally.`;

const withRetry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Gemini API call failed, retrying... (${retries} left)`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

// Initialize Gemini
const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCiLO-pbMChwMe3vIYyA7ZYrFPolOHNWWw";
};

export const createKernelSession = (history = []) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn('Gemini API key not found. Using mock mode.');
        return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: KERNEL_ARCHITECT_INSTRUCTION,
    });

    return model.startChat({
        history: history,
        generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
    });
};

// NEW: Intent Analysis for Voice Commands
// NEW: Intent Analysis for Voice Commands
// NEW: Intent Analysis for Voice Commands
export const analyzeIntent = async (userInput) => {
    // Normalize input: Full-width @ to half-width, remove extra spaces
    const normalizedInput = userInput.replace(/＠/g, '@').replace(/　/g, ' ').trim();
    const lowerInput = normalizedInput.toLowerCase();

    // 1. Prioritize Local Keyword Detection (Faster & More Reliable)

    // 1.1 Google Calendar / Schedule triggers
    if (lowerInput.match(/(?:[\/@＠]+)cal/) || lowerInput.includes('schedule') || lowerInput.includes('meeting') || lowerInput.includes('カレンダー') || lowerInput.includes('予定') || lowerInput.includes('会議')) {
        const message = normalizedInput.replace(/(?:[\/@＠]+)cal|schedule|meeting|カレンダー|予定|会議/gi, '').trim() || 'New Schedule';
        return {
            intent: 'SCHEDULE_EVENT',
            target_person: null,
            message: message,
            details: 'Detected via keyword',
            confidence: 1.0
        };
    }

    // 1.2 Task / Todo / Notebook triggers
    if (lowerInput.match(/(?:[\/@＠]+)amas/) || lowerInput.includes('todo') || lowerInput.includes('task') || lowerInput.includes('タスク') || lowerInput.includes('memo') || lowerInput.includes('メモ')) {
        const message = normalizedInput.replace(/(?:[\/@＠]+)amas|todo|task|タスク|memo|メモ/gi, '').trim() || 'New Task';
        return {
            intent: 'TODO_TASK',
            target_person: null,
            message: message,
            details: 'Detected via keyword',
            confidence: 1.0
        };
    }

    // 1.3 Morning Briefing / Start Day triggers
    if (lowerInput.includes('start') || lowerInput.includes('morning') || lowerInput.includes('briefing') || lowerInput.includes('おはよう') || lowerInput.includes('スタート') || lowerInput.includes('今日')) {
        return {
            intent: 'START_DAY',
            target_person: null,
            message: 'All-in-One Daily Briefing',
            details: 'Initiating AMAS Secretary Protocol...',
            confidence: 1.0
        };
    }

    // 1.4 Routine / Habit triggers
    if (lowerInput.includes('routine') || lowerInput.includes('habit') || lowerInput.includes('ルーティン') || lowerInput.includes('習慣')) {
        const message = normalizedInput.replace(/routine|habit|ルーティン|習慣/gi, '').trim() || 'New Routine';
        return {
            intent: 'ADD_ROUTINE',
            target_person: null,
            message: message,
            details: 'Habit Formation Protocol',
            confidence: 1.0
        };
    }

    // 1.5 Video connection triggers
    if (lowerInput.includes('video') || lowerInput.includes('ビデオ') || lowerInput.includes('call') || lowerInput.includes('通話')) {
        return {
            intent: 'CONNECT_VIDEO',
            target_person: null,
            message: userInput,
            confidence: 0.9
        };
    }

    // 1.6 Navigation triggers (Show Diary, Show Tasks, etc.)
    if (lowerInput.match(/show|open|go to|見せて|開いて|移動/)) {
        if (lowerInput.match(/diary|journal|日記/)) {
            return { intent: 'NAVIGATE', target_person: null, message: 'diary', confidence: 1.0 };
        }
        if (lowerInput.match(/memo|note|メモ/)) {
            return { intent: 'NAVIGATE', target_person: null, message: 'memo', confidence: 1.0 };
        }
        if (lowerInput.match(/task|todo|schedule|calendar|タスク|予定|カレンダー/)) {
            return { intent: 'NAVIGATE', target_person: null, message: 'task', confidence: 1.0 };
        }
    }

    // 1.7 Deployment triggers
    if (lowerInput.includes('deploy') || lowerInput.includes('デプロイ') || lowerInput.includes('launch') || lowerInput.includes('assembly')) {
        return {
            intent: 'DEPLOYMENT',
            target_person: null,
            message: 'Amane Deployment Protocol',
            details: 'Initializing 1-Click Assembly...',
            confidence: 1.0
        };
    }

    const apiKey = getApiKey();
    if (!apiKey) {
        // Default to Message/Memo in Mock Mode if no keywords matched
        return { intent: 'NOTEBOOK_MEMO', target_person: null, message: userInput, confidence: 0.5 };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: INTENT_ROUTER_INSTRUCTION,
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    return withRetry(async () => {
        const result = await model.generateContent(`${userInput}\n\n[Current System Time: ${new Date().toLocaleString()}]`);
        const response = await result.response;
        try {
            let text = response.text();
            // Clean markdown code blocks if present
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.error("Intent Analysis Parsing Error:", e);
            // Graceful fallback including the original message
            return {
                intent: 'NOTEBOOK_MEMO',
                target_person: null,
                message: userInput,
                original_transcript: userInput,
                details: 'AI Intent Analysis failed, saved as simple memo.',
                confidence: 0.5
            };
        }
    });
};

export const generateSecretNotebook = async (threadsId, igId) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "Identity established via local resonance protocol. (Demo mode)";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Identity: @${threadsId} / @${igId}. 
Generate a "Secret Notebook" entry. Focus on Amane Protocol themes: preserving silence, semantic resonance, and the "Ma" between digital actions. Output text only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "State vector initialization established.";
    });
};

export const processVoiceNote = async (transcript) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return `Voice Memo: ${transcript}`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the AMAS Secretary. Refine this raw speech transcript into a beautiful, insightful Personal Notebook entry.
  Transcript: "${transcript}"
  
  Style: Elegant, slightly philosophical, supportive, and organized. 
  Include: 
  - A summary of the core intent.
  - A "Resonance Observation" (mood/tone analysis).
  - Formal formatting.
  
  Output Markdown formatted text only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "Voice record established.";
    });
};

export const analyzeIntentProcess = async (decisionData) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { decision_type: "AUTONOMOUS" };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this decision process for Amane Protocol validation:
Data: ${JSON.stringify(decisionData)}
Determine if this was "AUTONOMOUS", "IMPULSIVE", or "COERCED". Return JSON only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        try {
            return JSON.parse(response.text() || "{}");
        } catch (e) {
            return { decision_type: "UNKNOWN" };
        }
    });
};

export const analyzeImage = async (base64Data, mimeType) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            notebookContent: "Visual analysis not available in demo mode.",
            gravityNodes: []
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: `You are the Antigravity Vision-Agent. Analyze this asset to extract both Semantic Depth (for Notebook) and Gravitational Topology (for AI Map).

        1. **Visual Semantics**: Examine material, lighting, and cultural signifiers.
        2. **Luxury Copywriting**: Generate a "ZARA Home" or "LVMH" style description.
        3. **Gravity Extraction**: Identify 3-5 key concepts (nodes) that anchor this image in the user's life.

        Output JSON structure:
        {
            "notebookContent": "# [Product Name]\n**OKE Grade: [X.X/10.0]**\n\n## Insighted Value\n[Luxury Description]\n\n## Atomic Facts\n- [Fact 1]\n- [Fact 2]",
            "gravityNodes": [
                { "id": "node-1", "label": "Concept Name", "mass": 0.8, "type": "material|emotion|memory" }
            ],
            "auraColor": "hex code (e.g. #FFD700)"
        }`
    };

    return withRetry(async () => {
        try {
            const result = await model.generateContent([imagePart, textPart]);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (e) {
            console.error("Gemini Vision Error:", e);
            // Fallback for valid non-JSON return or error
            return {
                notebookContent: "Visual Analysis halted. Preserving raw visual data.",
                gravityNodes: [],
                auraColor: "#FFFFFF"
            };
        }
    });
};

export const sendMessage = async (chat, message) => {
    if (!chat) {
        // Mock response if no API key
        return `Echo: ${message}\n\nThis is a mock response. Please configure VITE_GEMINI_API_KEY in .env to enable real AI responses.`;
    }

    return withRetry(async () => {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    });
};

/**
 * AMAS Semantic Diff Engine
 * Analyzes Before/After states to extract intent and entropy reduction.
 */
export const analyzeSemanticDiff = async (beforeBase64, afterBase64, mimeType = 'image/jpeg') => {
    const apiKey = getApiKey();
    if (!apiKey) return { entropy_reduction: 0.85, purified_intent: "Intent purified via local resonance." };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the AMAS Liaison Vision Engine. 
  Compare these two states (Before and After).
  1. Extract the "Semantic Diff" (What changed in meaning?).
  2. Calculate the "Entropy Reduction Rate" (0.0 to 1.0).
  3. Purify the user's "Want" into a single professional Backoffice Memo.
  Return JSON only: { "semantic_diff": "", "entropy_reduction": 0.0, "purified_intent": "" }`;

    const parts = [
        { inlineData: { data: beforeBase64, mimeType } },
        { inlineData: { data: afterBase64, mimeType } },
        { text: prompt }
    ];

    return withRetry(async () => {
        const result = await model.generateContent(parts);
        const response = await result.response;
        try {
            return JSON.parse(response.text());
        } catch (e) {
            return { entropy_reduction: 0.9, purified_intent: "Consensus formed automatically." };
        }
    });
};


/**
 * analyzeVisionCommerce
 * Specific vision-agent for detecting commerce-ready objects and generating reasoning.
 */
export const analyzeVisionCommerce = async (base64Data, mimeType = 'image/jpeg') => {
    const apiKey = getApiKey();
    if (!apiKey) return {
        items: [{ id: "MOCK-1", label: "Designer Watch", price: 12000, reasoning: "Fits your luxury resonance profile." }],
        insight: "Detected high-value assets matching your Personal Notebook preferences."
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are the AMAS Vision Commerce Engine.
    Analyze this image and detect objects that are suitable for "Agentic Commerce".
    
    1. Identify products (e.g., Furniture, Electronics, Fashion).
    2. Provide coordinates for each (x: 0-100, y: 0-100).
    3. Generate a "Resonance Reasoning" for why this fits a user seeking luxury and minimalist lifestyle.
    4. Categorize value (Low, Mid, High).

    Output JSON ONLY:
    {
        "insight": "General summary of the scene",
        "items": [
            {
                "id": "unique-id",
                "label": "Product Name",
                "price": 1000,
                "reasoning": "Resonance reasoning...",
                "coordinates": { "x": 50, "y": 50 },
                "valueCategory": "High"
            }
        ]
    }`;

    const parts = [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
    ];

    return withRetry(async () => {
        const result = await model.generateContent(parts);
        const response = await result.response;
        try {
            return JSON.parse(response.text());
        } catch (e) {
            console.error("Commerce analysis JSON parse failed", e);
            return { insight: response.text(), items: [] };
        }
    });
};
