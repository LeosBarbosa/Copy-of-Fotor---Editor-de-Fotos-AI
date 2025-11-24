
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Users, Edit } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

export const FutureFamilyScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; }> = ({ onBack, onEdit }) => {
    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef1 = useRef<HTMLInputElement>(null);
    const inputRef2 = useRef<HTMLInputElement>(null);

    const handleProcess = async () => {
        if (!image1 || !image2) {
            setError("Por favor, carregue as fotos de ambos os pais.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const { base64: b64_1, mimeType: mime1 } = await imageUrlToBase64(image1);
            const { base64: b64_2, mimeType: mime2 } = await imageUrlToBase64(image2);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Analyze the two reference images and create one ultra-realistic, high-definition family portrait featuring both individuals from the reference photos as the parents, together with their possible child — gender can be randomly a boy or a girl. Both parents must look exactly like in the reference images, preserving every facial feature, skin tone, hair color, and expression with absolute accuracy. The child should appear as a natural genetic blend of the parents, with believable, harmonious features, looking like a real offspring of the couple. Age of the child: around 8–12 years old. Expression: natural and friendly, reflecting warmth and family resemblance. The family stands close together, with relaxed, genuine body language — a natural, affectionate pose that conveys warmth and unity. Lighting should be soft and cinematic, coming from the front and slightly above, producing smooth, realistic shadows and catchlights in the eyes. Background is minimalistic and slightly defocused with a soft gradient in light blue or warm beige. Simulate the look and depth of field of a Canon EOS R5 full-frame mirrorless camera, using a Canon RF 50mm f/1.2L lens, ISO 200, aperture f/1.8. The image should have shallow depth of field (sharp focus on faces, soft background blur) and lifelike 8K resolution detail.`;

            const response = await ai.models.generateContent({
              model: AI_IMAGE_MODEL,
              contents: { parts: [
                  { inlineData: { data: b64_1, mimeType: mime1 } },
                  { inlineData: { data: b64_2, mimeType: mime2 } },
                  { text: prompt }
              ] },
              config: { responseModalities: [Modality.IMAGE] },
            });
            
            const candidate = response.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            let imageFound = false;
            for (const part of parts) {
                if (part.inlineData) {
                    const resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setProcessedImage(resultUrl);
                    imageFound = true;
                    break;
                }
            }
            if (!imageFound) {
                const text = candidate?.content?.parts?.[0]?.text;
                if (text) throw new Error(`A IA não gerou a imagem. Resposta: ${text}`);
                throw new Error("A IA não retornou uma imagem. Tente novamente.");
            }
        } catch (err: any) {
            console.error("Erro na Família Futura:", err);
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
                setError("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                setError(err.message || "Falha ao processar a imagem.");
            }
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleImageUpload = (file: File, setImage: (s: string) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `familia-futura-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <input type="file" ref={inputRef1} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage1)} className="hidden" accept="image/*" />
            <input type="file" ref={inputRef2} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], setImage2)} className="hidden" accept="image/*" />
            <header className="flex-shrink-0 z-10 p-4">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg drop-shadow-md">Família Futura IA</h1>
                </div>
            </header>
            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
                {isProcessing ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="font-semibold">Gerando sua família...</p>
                    </div>
                ) : processedImage ? (
                     <img src={processedImage} alt="Resultado" className="max-w-full max-h-full object-contain rounded-lg"/>
                ) : (
                    <div className="text-center max-w-2xl w-full">
                       <Users size={48} className="mx-auto text-blue-400 mb-4"/>
                        <h2 className="text-3xl font-bold mb-2">Família Futura IA</h2>
                        <p className="text-gray-400 mb-6">Descubra como seria o filho do casal.</p>
                        <div className="flex justify-center gap-8 mb-6">
                            <div onClick={() => inputRef1.current?.click()} className="w-32 h-40 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden">
                                {image1 ? <img src={image1} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Pai/Mãe 1</span>}
                            </div>
                            <div onClick={() => inputRef2.current?.click()} className="w-32 h-40 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden">
                                {image2 ? <img src={image2} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">Pai/Mãe 2</span>}
                            </div>
                        </div>
                        <button onClick={handleProcess} disabled={!image1 || !image2} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700">
                            Gerar Família
                        </button>
                    </div>
                )}
            </main>
            <footer className="flex-shrink-0 z-10 p-4">
                {error && <div className="max-w-md mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                {processedImage && (
                    <div className="max-w-md mx-auto flex items-center justify-center gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                        <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"><Edit size={18} /> Editar</button>
                        <button onClick={handleDownload} className="bg-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                    </div>
                )}
            </footer>
        </div>
    );
};
