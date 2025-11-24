
import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { fileToBlobUrl } from '../utils/fileUtils';

interface UseAiGenerationReturn {
    originalImage: string | null;
    processedImage: string | null;
    isProcessing: boolean;
    error: string | null;
    setOriginalImage: (url: string | null) => void;
    handleImageUpload: (file: File) => void;
    generate: (prompt: string, options?: { model?: string, additionalImages?: string[], systemInstruction?: string, imageOverride?: string }) => Promise<string | void>;
    reset: () => void;
}

export const useAiGeneration = (initialImage: string | null = null): UseAiGenerationReturn => {
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = useCallback((file: File) => {
        const url = fileToBlobUrl(file);
        setOriginalImage(url);
        setProcessedImage(null);
        setError(null);
    }, []);

    const reset = useCallback(() => {
        setOriginalImage(null);
        setProcessedImage(null);
        setError(null);
        setIsProcessing(false);
    }, []);

    const generate = useCallback(async (prompt: string, options: { model?: string, additionalImages?: string[], systemInstruction?: string, imageOverride?: string } = {}) => {
        // Permite que uma ferramenta substitua a imagem principal (ex: Stitch usa o template como base)
        const imgToUse = options.imageOverride || originalImage;

        if (!imgToUse) {
            setError("Nenhuma imagem selecionada.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const resultUrl = await aiService.generateImage({
                image: imgToUse,
                prompt,
                model: options.model,
                additionalImages: options.additionalImages,
                systemInstruction: options.systemInstruction
            });
            setProcessedImage(resultUrl);
            return resultUrl;
        } catch (err: any) {
            console.error("Hook Generation Error:", err);
            setError(err.message || "Falha na geração da imagem.");
        } finally {
            setIsProcessing(false);
        }
    }, [originalImage]);

    return {
        originalImage,
        processedImage,
        isProcessing,
        error,
        setOriginalImage,
        handleImageUpload,
        generate,
        reset
    };
};
