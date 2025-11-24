
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, History, Edit, CheckSquare, Square } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const sampleImages = [
    { name: 'Retrato', url: 'https://storage.googleapis.com/aistudio-project-files/89c17245-0925-4632-a550-985c7d2429a3/e00665f8-5807-4b77-929c-6a16f22e841d' },
    { name: 'Casal', url: 'https://storage.googleapis.com/aistudio-project-files/89c17245-0925-4632-a550-985c7d2429a3/5668e219-417c-47a3-863a-2321c172088f' },
];

const ImageCompare: React.FC<{ before: string; after: string }> = ({ before, after }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    };
    return (
        <div ref={containerRef} className="relative w-full h-full select-none" onMouseMove={handleMove}>
            <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src={before} alt="Antes" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <div className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize" style={{ left: `calc(${sliderPos}% - 1px)` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
        </div>
    );
};

export const OldPhotoRestorerScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; }> = ({ onBack, onEdit }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [shouldColorize, setShouldColorize] = useState(true);
    const [enhanceFace, setEnhanceFace] = useState(true);

    const handleProcess = async () => {
        if (!originalImage) return;
        setIsProcessing(true);
        setError(null);
        try {
            const { base64, mimeType } = await imageUrlToBase64(originalImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let prompt = "Restaure esta fotografia antiga. Remova quaisquer arranhões, poeira, rasgos e vincos. Corrija o desbotamento da cor, melhore a clareza geral e o contraste. O objetivo é fazer a foto parecer como se tivesse sido tirada recentemente, preservando seu caráter original.";

            if (shouldColorize) {
                prompt += " Se a foto for em preto e branco, colore-a com cores realistas.";
            }

            if (enhanceFace) {
                prompt += " Preste atenção especial para aprimorar os detalhes faciais de forma sutil, melhorando a clareza dos olhos e a textura da pele sem parecer artificial.";
            }

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
                if (text) throw new Error(`Falha: ${text}`);
                throw new Error("A IA não retornou uma imagem.");
            }
        } catch (err: any) {
            console.error("Erro na restauração de fotos:", err);
            setError(err.message || "Falha ao processar a imagem.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setOriginalImage(url);
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
        link.download = `foto-restaurada-${Date.now()}.jpg`;
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
                    <h1 className="font-semibold text-lg drop-shadow-md">Restaurador de Fotos Antigas IA</h1>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
                 {isProcessing ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="font-semibold">Restaurando suas memórias...</p>
                    </div>
                ) : processedImage && originalImage ? (
                    <ImageCompare before={originalImage} after={processedImage} />
                ) : originalImage ? (
                    <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain rounded-lg"/>
                ) : (
                    <div className="text-center max-w-2xl">
                       <History size={48} className="mx-auto text-blue-400 mb-4"/>
                        <h2 className="text-3xl font-bold mb-2">Restaurador de Fotos Antigas</h2>
                        <p className="text-gray-400 mb-6">Repare arranhões, desbotamento e danos em fotos antigas.</p>
                        <button onClick={() => inputRef.current?.click()} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-blue-700 mx-auto">
                            <Upload size={20} /> Carregar Imagem
                        </button>
                        <p className="text-gray-500 text-sm my-6">ou experimente um destes:</p>
                         <div className="flex justify-center gap-4">
                            {sampleImages.map((img) => (
                                <div key={img.name} onClick={() => handleSampleSelect(img.url)} className="cursor-pointer group">
                                    <img src={img.url} alt={img.name} className="w-24 h-36 rounded-md object-cover transition-all group-hover:scale-105 group-hover:ring-2 ring-blue-500" loading="lazy" decoding="async" />
                                    <p className="text-sm text-gray-400 mt-2 group-hover:text-white">{img.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="flex-shrink-0 z-10 p-4">
                {error && <div className="max-w-xl mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                {originalImage && (
                    <div className="max-w-xl mx-auto flex items-center gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                        <div className="flex-1 flex flex-col gap-2">
                           <button onClick={() => setShouldColorize(!shouldColorize)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                                {shouldColorize ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} />}
                                Colorir (se P&B)
                           </button>
                           <button onClick={() => setEnhanceFace(!enhanceFace)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                                {enhanceFace ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} />}
                                Aprimorar Rosto
                           </button>
                        </div>
                         <div className="w-px self-stretch bg-gray-700"></div>
                         <div className="flex items-center gap-3">
                            <button onClick={handleProcess} disabled={isProcessing} className="bg-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
                                {isProcessing ? '...' : (processedImage ? 'Aplicar Novamente' : 'Restaurar')}
                            </button>
                            {processedImage && (
                                <>
                                    <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold p-3 rounded-lg hover:bg-gray-700"><Edit size={20} /></button>
                                    <button onClick={handleDownload} className="bg-blue-600 font-bold p-3 rounded-lg hover:bg-blue-700"><Download size={20} /></button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};
