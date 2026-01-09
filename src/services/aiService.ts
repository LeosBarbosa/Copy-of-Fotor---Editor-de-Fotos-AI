import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils.ts';
import { AI_IMAGE_MODEL, AI_IMAGE_PRO_MODEL } from '../config/constants.ts';

const API_KEY = process.env.API_KEY;

interface GenerationOptions {
    model?: string;
    prompt: string;
    image: string; // Blob URL or Base64
    additionalImages?: string[];
    systemInstruction?: string;
}

export const aiService = {
    generateImage: async ({ model = AI_IMAGE_MODEL, prompt, image, additionalImages = [], systemInstruction }: GenerationOptions): Promise<string> => {
        if (!API_KEY) {
            throw new Error("Chave de API não configurada.");
        }

        try {
            const { base64: mainBase64, mimeType: mainMime } = await imageUrlToBase64(image);
            
            const parts: any[] = [
                { inlineData: { data: mainBase64, mimeType: mainMime } }
            ];

            for (const imgUrl of additionalImages) {
                const { base64, mimeType } = await imageUrlToBase64(imgUrl);
                parts.push({ inlineData: { data: base64, mimeType } });
            }

            const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
            parts.push({ text: finalPrompt });

            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            // Use gemini-3-pro-image-preview for 'pro' requests, otherwise flash-image
            const targetModel = model.includes('pro') ? AI_IMAGE_PRO_MODEL : AI_IMAGE_MODEL;

            const response = await ai.models.generateContent({
                model: targetModel,
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            if (!candidate) {
                throw new Error("A IA não retornou candidatos.");
            }

            const responseParts = candidate?.content?.parts || [];
            const imagePart = responseParts.find(p => p.inlineData);

            if (imagePart?.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }

            const textResponse = responseParts.find(p => p.text)?.text;
            if (textResponse) {
                throw new Error(`A IA recusou a geração: ${textResponse}`);
            }

            throw new Error("A IA retornou uma resposta vazia.");

        } catch (error: any) {
            console.error("AI Service Error:", error);
            throw new Error(error.message || "Ocorreu um erro na geração.");
        }
    }
};