import { requestUrl } from "obsidian";

interface Message {
    role: string;
    content: string;
}

export interface Model {
    id: string;
    name: string;
}

export class LLMService {

    // ========== 모델 목록 가져오기 ==========

    async getModels(provider: string, apiKey: string): Promise<Model[]> {
        if (!apiKey) return [];

        switch (provider) {
            case 'openrouter':
                return this.getOpenRouterModels();
            case 'openai':
                return this.getOpenAIModels(apiKey);
            case 'anthropic':
                return this.getAnthropicModels(); // API 없음, 하드코딩
            case 'gemini':
                return this.getGeminiModels(apiKey);
            default:
                return [];
        }
    }

    async getOpenRouterModels(): Promise<Model[]> {
        try {
            const response = await requestUrl({
                url: "https://openrouter.ai/api/v1/models",
                method: "GET"
            });
            if (response.status === 200) {
                return response.json.data.map((m: any) => ({
                    id: m.id,
                    name: m.name || m.id
                }));
            }
            return [];
        } catch (e) {
            console.error("OpenRouter models fetch failed:", e);
            return [];
        }
    }

    async getOpenAIModels(apiKey: string): Promise<Model[]> {
        try {
            const response = await requestUrl({
                url: "https://api.openai.com/v1/models",
                method: "GET",
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            if (response.status === 200) {
                const chatModels = response.json.data
                    .filter((m: any) => m.id.includes('gpt'))
                    .map((m: any) => ({ id: m.id, name: m.id }));
                return chatModels;
            }
            return [];
        } catch (e) {
            console.error("OpenAI models fetch failed:", e);
            return [];
        }
    }

    getAnthropicModels(): Model[] {
        // Anthropic doesn't have a public models API
        return [
            { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
            { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
            { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
            { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
            { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" }
        ];
    }

    async getGeminiModels(apiKey: string): Promise<Model[]> {
        try {
            const response = await requestUrl({
                url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
                method: "GET"
            });
            if (response.status === 200) {
                return response.json.models
                    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                    .map((m: any) => ({
                        id: m.name.replace('models/', ''),
                        name: m.displayName || m.name
                    }));
            }
            return [];
        } catch (e) {
            console.error("Gemini models fetch failed:", e);
            return [];
        }
    }

    // ========== 연결 테스트 ==========

    async testConnection(provider: string, apiKey: string): Promise<boolean> {
        if (!apiKey) return false;

        try {
            switch (provider) {
                case 'openrouter':
                    const orModels = await this.getOpenRouterModels();
                    return orModels.length > 0;
                case 'openai':
                    const oaModels = await this.getOpenAIModels(apiKey);
                    return oaModels.length > 0;
                case 'anthropic':
                    return await this.testAnthropic(apiKey);
                case 'gemini':
                    const gModels = await this.getGeminiModels(apiKey);
                    return gModels.length > 0;
                default:
                    return false;
            }
        } catch (e) {
            return false;
        }
    }

    private async testAnthropic(apiKey: string): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: "https://api.anthropic.com/v1/messages",
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1,
                    messages: [{ role: "user", content: "test" }]
                })
            });
            return response.status === 200;
        } catch (e: any) {
            // 401 = invalid key, 200 = valid
            return e?.status !== 401;
        }
    }

    // ========== 메시지 전송 ==========

    async sendMessage(provider: string, apiKey: string, model: string, messages: Message[]): Promise<string> {
        switch (provider) {
            case 'openrouter':
                return this.sendToOpenRouter(apiKey, model, messages);
            case 'openai':
                return this.sendToOpenAI(apiKey, model, messages);
            case 'anthropic':
                return this.sendToAnthropic(apiKey, model, messages);
            case 'gemini':
                return this.sendToGemini(apiKey, model, messages);
            default:
                throw new Error(`Provider ${provider} not supported.`);
        }
    }

    private async sendToOpenRouter(apiKey: string, model: string, messages: Message[]): Promise<string> {
        const response = await requestUrl({
            url: "https://openrouter.ai/api/v1/chat/completions",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, messages })
        });
        if (response.status === 200) {
            return response.json.choices[0].message.content;
        }
        throw new Error(`OpenRouter Error: ${response.status}`);
    }

    private async sendToOpenAI(apiKey: string, model: string, messages: Message[]): Promise<string> {
        const response = await requestUrl({
            url: "https://api.openai.com/v1/chat/completions",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model, messages })
        });
        if (response.status === 200) {
            return response.json.choices[0].message.content;
        }
        throw new Error(`OpenAI Error: ${response.status}`);
    }

    private async sendToAnthropic(apiKey: string, model: string, messages: Message[]): Promise<string> {
        const systemMsg = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const response = await requestUrl({
            url: "https://api.anthropic.com/v1/messages",
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model || "claude-3-5-sonnet-20241022",
                max_tokens: 4096,
                system: systemMsg?.content || "",
                messages: chatMessages
            })
        });
        if (response.status === 200) {
            return response.json.content[0].text;
        }
        throw new Error(`Anthropic Error: ${response.status}`);
    }

    private async sendToGemini(apiKey: string, model: string, messages: Message[]): Promise<string> {
        const systemMsg = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const modelName = model || "gemini-1.5-pro";
        const response = await requestUrl({
            url: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatMessages,
                systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined
            })
        });
        if (response.status === 200) {
            return response.json.candidates[0].content.parts[0].text;
        }
        throw new Error(`Gemini Error: ${response.status}`);
    }
}
