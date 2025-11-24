
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Edit } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const sampleImages = [
    { name: 'Fashion', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=300&fit=crop' },
    { name: 'Casual', url: 'https://images.unsplash.com/photo-1529139574466-a30232fe3938?w=200&h=300&fit=crop' },
];

export const LifestyleSceneScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; initialImage?: string | null; }> = ({ onBack, onEdit, initialImage }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sceneDescription, setSceneDescription] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleProcess = async () => {
        if (!originalImage || !sceneDescription.trim()) {
            setError("Por favor, carregue uma imagem e descreva a cena.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const { base64, mimeType } = await imageUrlToBase64(originalImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Create a photorealistic, 4K lifestyle scene. Place the subject from the uploaded image into the following scenario: "${sceneDescription}". Ensure consistent lighting, shadows, and perspective. The subject should look naturally integrated into the environment. Maintain the subject's identity and facial features with high fidelity.`;

            const response = await ai.models.generateContent({
              model: AI_IMAGE_MODEL,
              contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] },
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
            console.error("Erro na Cena de Estilo de Vida:", err);
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
                setError("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                setError(err.message || "Falha ao processar a imagem.");
            }
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalImage(e.target?.result as string);
            setProcessedImage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
    };

    const handleSampleSelect = (url: string) => {
        setOriginalImage(url);
        setProcessedImage(null);
    };

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `lifestyle-scene-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <header className="flex-shrink-0 z-10 p-4">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg drop-shadow-md">Cena de Estilo de Vida</h1>
                </div>
            </header>
            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
                {isProcessing ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="font-semibold">Criando sua cena...</p>
                    </div>
                ) : processedImage ? (
                     <img src={processedImage} alt="Resultado" className="max-w-full max-h-full object-contain rounded-lg"/>
                ) : originalImage ? (
                    <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg"/>
                ) : (
                    <div className="text-center max-w-2xl">
                       <ImageIcon size={48} className="mx-auto text-blue-400 mb-4"/>
                        <h2 className="text-3xl font-bold mb-2">Cena de Estilo de Vida IA</h2>
                        <p className="text-gray-400 mb-6">Coloque seu produto ou modelo em qualquer cenário realista.</p>
                        <button onClick={() => inputRef.current?.click()} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-blue-700 mx-auto">
                            <Upload size={20} /> Carregar Imagem
                        </button>
                         <div className="flex justify-center gap-4 mt-6">
                            {sampleImages.map((img) => (
                                <div key={img.name} onClick={() => handleSampleSelect(img.url)} className="cursor-pointer group">
                                    <img src={img.url} alt={img.name} className="w-24 h-36 rounded-md object-cover transition-all group-hover:scale-105 group-hover:ring-2 ring-blue-500" loading="lazy" decoding="async" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <footer className="flex-shrink-0 z-10 p-4">
                {error && <div className="max-w-md mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                {originalImage && (
                    <div className="max-w-xl mx-auto flex flex-col gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                        <textarea
                            value={sceneDescription}
                            onChange={(e) => setSceneDescription(e.target.value)}
                            placeholder="Descreva o cenário (ex: um café moderno em Paris, pôr do sol na praia...)"
                            className="w-full h-20 bg-gray-700/50 p-2 rounded-md text-sm resize-none placeholder-gray-400"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleProcess} disabled={isProcessing || !sceneDescription} className="flex-1 bg-blue-600 font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
                                {isProcessing ? 'Gerando...' : 'Gerar Cena'}
                            </button>
                            {processedImage && (
                                <>
                                    <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"><Edit size={18} /></button>
                                    <button onClick={handleDownload} className="bg-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Download size={18} /></button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};
