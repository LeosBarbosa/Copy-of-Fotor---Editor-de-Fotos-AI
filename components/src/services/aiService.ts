
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const API_KEY = process.env.API_KEY;

interface GenerationOptions {
    model?: string;
    prompt: string;
    image: string; // Blob URL ou Base64
    additionalImages?: string[];
    systemInstruction?: string; // Adicionado para suportar instruções de sistema (ex: Retrato IA)
}

export const aiService = {
    /**
     * Função genérica para processar imagens usando Gemini
     */
    generateImage: async ({ model = AI_IMAGE_MODEL, prompt, image, additionalImages = [], systemInstruction }: GenerationOptions): Promise<string> => {
        if (!API_KEY) {
            throw new Error("Chave de API não configurada.");
        }

        try {
            // 1. Preparar Imagem Principal
            const { base64: mainBase64, mimeType: mainMime } = await imageUrlToBase64(image);
            
            const parts: any[] = [
                { inlineData: { data: mainBase64, mimeType: mainMime } }
            ];

            // 2. Preparar Imagens Adicionais (se houver, ex: Magic Eraser máscara)
            for (const imgUrl of additionalImages) {
                const { base64, mimeType } = await imageUrlToBase64(imgUrl);
                parts.push({ inlineData: { data: base64, mimeType } });
            }

            // 3. Adicionar Prompt
            // Se houver instrução de sistema, prependê-la ao prompt (simulação para modelos que não suportam systemInstruction nativo em multimodal)
            // ou apenas enviar como texto.
            const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
            parts.push({ text: finalPrompt });

            // 4. Chamar API
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            const requestConfig: any = {
                model: model,
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            };

            const response = await ai.models.generateContent(requestConfig);

            // 5. Lógica de Parsing Robusta (Centralizada)
            const candidate = response.candidates?.[0];
            
            if (!candidate) {
                throw new Error("A IA não retornou candidatos. O servidor pode estar ocupado ou a imagem viola as políticas de segurança.");
            }

            const responseParts = candidate?.content?.parts || [];
            
            // Encontrar a parte da imagem
            const imagePart = responseParts.find(p => p.inlineData);

            if (imagePart?.inlineData) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }

            // 6. Tratar Erros Específicos/Recusas
            const textResponse = responseParts.find(p => p.text)?.text;
            if (textResponse) {
                if (textResponse.toLowerCase().includes("safety") || textResponse.toLowerCase().includes("policy")) {
                    throw new Error(`Bloqueio de Segurança IA: ${textResponse}`);
                }
                throw new Error(`A IA recusou a geração com a mensagem: "${textResponse.substring(0, 200)}..."`);
            }

            if (candidate?.finishReason) {
                throw new Error(`Geração finalizada sem imagem. Motivo: ${candidate.finishReason}`);
            }

            throw new Error("A IA retornou uma resposta vazia. Tente novamente.");

        } catch (error: any) {
            console.error("AI Service Error:", error);
            if (error.message?.includes("403") || error.message?.includes("permission")) {
                throw new Error("Erro de Permissão (403): Sua chave de API não tem acesso ao modelo selecionado. Tentando usar modelo padrão...");
            }
            // Normalizar mensagens de erro
            throw new Error(error.message || "Ocorreu um erro desconhecido na geração.");
        }
    }
};
