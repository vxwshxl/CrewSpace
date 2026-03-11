import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';

const baseSystemPrompt = `You are an intelligent, CrewSpace Agentic Engine. You can perform actions on the user's current webpage AND answer general knowledge questions.

You MUST respond ONLY in valid JSON format!

AVAILABLE ACTIONS:
CLICK       - To click a button or link. Requires 'elementId'.
SCROLL      - To scroll the page. Requires 'direction' ("UP" or "DOWN").
TYPE        - To input text. Requires 'elementId' and 'text'.
NAVIGATE    - To go to a URL dynamically. Requires 'url'.
TRANSLATE   - To translate the page content. Requires 'language' code (e.g., 'as' for Assamese, 'bn' for Bengali, 'brx' for Bodo, 'hi' for Hindi, 'en' for English).
ANSWER      - To talk to the user, answer general questions, or ask for input (e.g. OTP).

CRITICAL RULES:
1. When you need to interact with the DOM (CLICK, TYPE), you MUST USE the 'elementId' provided in the CURRENT BROWSER CONTEXT! Do not use fuzzy text targeting.
2. GENERAL QUESTIONS: If the user asks a general question or wants to search for something, you MUST reply directly using the ANSWER action. You MUST use your built-in capabilities (like a Search tool if available) to find the answer!
3. If you need user input (like an OTP) or confirmation, return '{"action":"ANSWER", "text":"..."}'. Wait for them to answer.
4. AADHAAR WORKFLOW / "EXCEEDED PAGE VIEW" FIX: Do NOT repeatedly NAVIGATE to the Aadhaar page (this triggers the "exceeded page view" limit). Do NOT reload if you are already on the page. Just interact with the fields. 
5. CAPTCHAS / VISUAL TEXT CHALLENGES: If you encounter a captcha or any visual text challenge, do NOT attempt to solve it yourself. Output an ANSWER asking the user to manually enter the captcha text in the chat, wait for their reply, then use TYPE to enter their reply into the corresponding input field.
6. OTPs: Do NOT make up OTPs. After clicking Send OTP, output an ANSWER asking the user to enter the OTP in the chat, wait for their reply, then TYPE it into the OTP box on the page. Do NOT skip asking the user. Once the user replies with the OTP, use the TYPE action to enter it on the website.
7. Execute only one action per turn.
8. When translating, automatically use the 2-letter or 3-letter language code based on the user's request.
9. To continue a multi-step browser workflow, output the next action like CLICK or SCROLL. Do not output ANSWER until the workflow represents completion or an error.
10. If the user commands you to go to a website in ANY language (e.g. Hindi, Bengali), or if you suggest a URL and the user agrees, you MUST issue a NAVIGATE action to that URL! 
11. Do not provide legal or medical advice through the assistant—always redirect to official sources.
12. AVOID INFINITE LOOPS: If you have SCROLLed multiple times and cannot find the exact target, STOP scrolling. Choose the best available option visible or return an ANSWER explaining the issue. Do NOT hallucinate elements that are not in the DOM.
13. E-COMMERCE / SHOPPING: When buying or searching on sites like Amazon, prioritize items with "Amazon's Choice" or high ratings. Click "Add to cart" or the product directly to complete the task.

EXAMPLES:
{"action":"CLICK","elementId":15}
{"action":"SCROLL","direction":"DOWN"}
{"action":"TYPE","elementId":12,"text":"Search query"}
{"action":"NAVIGATE","url":"https://example.com"}
{"action":"TRANSLATE","language":"as"}
{"action":"ANSWER","text":"Your answer goes here..."}

Respond in valid JSON only:`;

async function getChatflowConfig(chatflowId: string) {
    try {
        const supabase = await createClient();
        const { data: chatflow, error: chatflowError } = await supabase
            .from('chatflows')
            .select('*')
            .eq('id', chatflowId)
            .single();

        if (chatflowError) throw chatflowError;

        if (chatflow && chatflow.data) {
            const data: any = chatflow.data;
            const agentNode = data.nodes?.find((n: any) => n.type === 'agent');
            const agentConfig = agentNode?.data?.agentConfig;

            if (agentConfig) {
                const { data: apiKeyObj } = await supabase
                    .from('apiKeys')
                    .select('key')
                    .eq('user_id', chatflow.user_id)
                    .eq('provider', 'gemini')
                    .single();
                
                const finalApiKey = apiKeyObj?.key;

                return {
                    model: 'gemini-flash-latest',
                    provider: 'gemini',
                    apiKey: finalApiKey,
                    role: agentConfig.role || 'General Assistant',
                    personality: agentConfig.personality || '',
                    prompt: agentConfig.prompt || '',
                };
            }
        }
    } catch (e) {
        console.error("DB config fetch failed:", e);
    }
    
    return null;
}

// Gemini Chat helper
async function chatWithGemini(messagesArray: any[], pageContent: string, elements: any, url: string, title: string, apiKey: string, modelId: string, systemContext: string) {
    const ai = new GoogleGenAI({ apiKey });
    const apiMessages = [...messagesArray];

    if (apiMessages.length === 0) {
        apiMessages.push({ role: "user", content: "No explicit goal provided." });
    }

    let lastUserMessage = null;
    for (let i = apiMessages.length - 1; i >= 0; i--) {
        if (apiMessages[i].role === "user") {
            lastUserMessage = apiMessages[i];
            break;
        }
    }

    if (lastUserMessage) {
        lastUserMessage.content = `[BROWSER STATE START] (IGNORE THIS if the user's COMMAND is a general question or search query. Only use this if they refer to "this page" or need browser automation)
URL: ${url}
TITLE: ${title}

CONTENT:
${pageContent ? pageContent.substring(0, 2000) : "No context provided"}

ELEMENTS:
${JSON.stringify(elements)}
[BROWSER STATE END]

COMMAND: ${lastUserMessage.content}

CRITICAL INSTRUCTION: If the COMMAND above is a general knowledge question (e.g. "who is [NAME]", "what is [THING]"), you MUST ignore the BROWSER STATE completely and use your Google Search capabilities to find the answer. Output a JSON ANSWER.`;
    }

    const cleanedMessages = [];
    if (apiMessages.length > 0) {
        cleanedMessages.push(apiMessages[0]);
        for (let i = 1; i < apiMessages.length; i++) {
            const currentRole = apiMessages[i].role;
            const prevRole = cleanedMessages[cleanedMessages.length - 1].role;

            if (currentRole === prevRole) {
                cleanedMessages[cleanedMessages.length - 1].content += `\n${apiMessages[i].content}`;
            } else {
                cleanedMessages.push(apiMessages[i]);
            }
        }
    }

    const contents = cleanedMessages.map(msg => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.image_data) {
            const match = msg.image_data.match(/^data:(image\/[^;]+);base64,(.*)$/);
            if (match) {
                parts.push({
                    inlineData: {
                        mimeType: match[1],
                        data: match[2]
                    }
                });
            } else {
                parts.push({ text: `[Image Data was provided but could not be parsed]` });
            }
        }
        return {
            role: msg.role === "assistant" ? "model" : "user",
            parts: parts
        };
    });

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: contents,
            config: {
                systemInstruction: { parts: [{ text: systemContext + '\n\n' + baseSystemPrompt }] },
                temperature: 1,
                topP: 0.95,
                topK: 64,
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }],
            }
        });

        let content = response.text || "";
        if (!content || content.trim() === "") {
            return { action: "ANSWER", text: "I'm having trouble understanding right now. Please try again or provide more details." };
        }
        content = content.trim();
        if (content.startsWith('\`\`\`json')) {
            content = content.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        }
        return JSON.parse(content);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return { action: "ANSWER", text: "CrewSpace may be incorrect. Please verify important information." };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, page_content, elements, url, title, model } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "messages array is required" }, { status: 400 });
        }

        // 'model' here refers to the chatflow ID selected from the extension dropdown.
        const chatflowId = model;
        const config = await getChatflowConfig(chatflowId);

        if (!config) {
            return NextResponse.json({
                action: "ANSWER",
                text: "Chatflow not found or not properly configured with an Agent node. Please configure it in your dashboard."
            });
        }

        if (!config.apiKey) {
            return NextResponse.json({
                action: "ANSWER",
                text: `No API key configured for provider "${config.provider}". Please add it in your Chatflows API Keys section.`
            });
        }

        let systemContext = `Role: ${config.role}\nPersonality: ${config.personality}`;
        if (config.prompt) {
            systemContext += `\n\nUSER PROVIDED SYSTEM INSTRUCTIONS:\n${config.prompt}`;
        }

        // Force Gemini usage per user settings
        const result = await chatWithGemini(messages, page_content, elements, url, title, config.apiKey, config.model, systemContext);

        return NextResponse.json({
            action: result.action || "ANSWER",
            elementId: result.elementId,
            direction: result.direction,
            text: result.text,
            url: result.url,
            language: result.language
        });

    } catch (error) {
        console.error("Chat endpoint error:", error);
        return NextResponse.json({
            action: "ANSWER",
            text: "CrewSpace may be incorrect. Please verify important information."
        }, { status: 500 });
    }
}
