import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL, AI_IMAGE_PRO_MODEL } from '../config/constants';

export const aiService = {
    generateImage: async ({ 
        model = AI_IMAGE_MODEL, 
        prompt, 
        image, 
        additionalImages = [], 
        systemInstruction 
    }: {
        model?: string;
        prompt: string;
        image: string;
        additionalImages?: string[];
        systemInstruction?: string;
    }): Promise<string> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        try {
            const { base64: mainBase64, mimeType: mainMime } = await imageUrlToBase64(image);
            const parts: any[] = [{ inlineData: { data: mainBase64, mimeType: mainMime } }];

            for (const imgUrl of additionalImages) {
                const { base64, mimeType } = await imageUrlToBase64(imgUrl);
                parts.push({ inlineData: { data: base64, mimeType } });
            }

            const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
            parts.push({ text: finalPrompt });

            const response = await ai.models.generateContent({
                model: model.includes('pro') ? AI_IMAGE_PRO_MODEL : model,
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }

            throw new Error("A IA não retornou uma imagem válida.");
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            throw new Error(error.message || "Falha na conexão com o servidor de IA.");
        }
    }
};