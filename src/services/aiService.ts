
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL, AI_IMAGE_PRO_MODEL } from '../config/constants';

const API_KEY = process.env.API_KEY;

interface GenerationOptions {
    model?: string;
    prompt: string;
    image: string;
    additionalImages?: string[];
    systemInstruction?: string;
}

export const aiService = {
    generateImage: async ({ model = AI_IMAGE_MODEL, prompt, image, additionalImages = [], systemInstruction }: GenerationOptions): Promise<string> => {
        if (!API_KEY) throw new Error("Chave de API não configurada.");

        try {
            const { base64: mainBase64, mimeType: mainMime } = await imageUrlToBase64(image);
            const parts: any[] = [{ inlineData: { data: mainBase64, mimeType: mainMime } }];

            for (const imgUrl of additionalImages) {
                const { base64, mimeType } = await imageUrlToBase64(imgUrl);
                parts.push({ inlineData: { data: base64, mimeType } });
            }

            const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
            parts.push({ text: finalPrompt });

            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            // Se o modelo solicitado for o Pro, garantimos o uso do gemini-3-pro-image-preview
            const modelToUse = model.includes('pro') ? AI_IMAGE_PRO_MODEL : AI_IMAGE_MODEL;

            const response = await ai.models.generateContent({
                model: modelToUse,
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            if (!candidate) throw new Error("A IA não retornou resultados.");

            const imagePart = candidate.content.parts.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }

            const textResponse = candidate.content.parts.find(p => p.text)?.text;
            if (textResponse) throw new Error(`IA recusou: ${textResponse}`);
            
            throw new Error("Falha ao gerar imagem.");
        } catch (error: any) {
            console.error("AI Error:", error);
            throw new Error(error.message || "Erro na conexão com Google AI.");
        }
    }
};
