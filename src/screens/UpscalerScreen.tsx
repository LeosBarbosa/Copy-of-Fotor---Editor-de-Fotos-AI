
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Zap, Gem, Download, Edit } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64, fileToBlobUrl } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const sampleImages = [
    { name: 'Retrato', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=300&fit=crop' },
    { name: 'Anime', url: 'https://images.unsplash.com/photo-1579401923644-3e3c04c53a7b?w=200&h=300&fit=crop' },
    { name: 'Paisagem', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=300&fit=crop' },
    { name: 'Animal', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=300&fit=crop' }
];

const ImageCompare: React.FC<{ before: string; after: string }> = ({ before, after }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const handleMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPos(percent);
    };

    return (
        <div className="relative w-full h-full select-none" onMouseMove={handleMove}>
            <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-contain" decoding="async" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src={before} alt="Antes" className="absolute inset-0 w-full h-full object-contain" decoding="async" />
            </div>
            <div className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize" style={{ left: `calc(${sliderPos}% - 2px)` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
             <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</div>
             <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Aprimorado</div>
        </div>
    );
};

export const UpscalerScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; initialImage?: string | null; }> = ({ onBack, onEdit, initialImage }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(2);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialImage) {
            handleUpscale(initialImage, scale);
        }
    }, [initialImage]);

    const handleImageUpload = (file: File) => {
        const blobUrl = fileToBlobUrl(file);
        setOriginalImage(blobUrl);
        setProcessedImage(null);
        handleUpscale(blobUrl, scale);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };
    
    const handleSampleSelect = (url: string) => {
        setOriginalImage(url);
        setProcessedImage(null);
        handleUpscale(url, scale);
    };

    const handleUpscale = async (imageUrl: string, currentScale: number) => {
        setIsProcessing(true);
        setError(null);
        try {
            const { base64, mimeType } = await imageUrlToBase64(imageUrl);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const scaleText = currentScale === 2 ? "dobrando suas dimensões (2x)" : "quadruplicando suas dimensões (4x) para uma resolução ultra-alta";
            const prompt = `Faça o upscale desta imagem para uma resolução mais alta, ${scaleText}. Melhore significativamente os detalhes, a clareza e a nitidez sem introduzir artefatos. Mantenha a composição e as cores originais. O resultado deve ser uma versão muito mais clara e detalhada da imagem original.`;
            
            const response = await ai.models.generateContent({
              model: AI_IMAGE_MODEL,
              contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] },
              config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            let newImageFound = false;

            for (const part of parts) {
                if (part.inlineData) {
                    const newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setProcessedImage(newImageUrl);
                    newImageFound = true;
                    break;
                }
            }
            if (!newImageFound) {
                const text = candidate?.content?.parts?.[0]?.text;
                if (text) throw new Error(`Falha: ${text}`);
                throw new Error("A IA não retornou uma imagem. Tente novamente.");
            }

        } catch (err: any) {
            console.error("Erro no upscale:", err);
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
                setError("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                setError(err.message || "Falha ao fazer o upscale da imagem. Tente novamente.");
            }
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `upscaled-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRescale = (newScale: number) => {
        setScale(newScale);
        if (originalImage) {
            handleUpscale(originalImage, newScale);
        }
    }

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <header className="flex-shrink-0 z-10 p-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg drop-shadow-md">Upscaler de IA</h1>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 relative">
                {isProcessing && (
                     <div className="absolute inset-0 bg-zinc-900/80 z-10 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                        <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-white font-semibold text-lg">Aprimorando resolução...</h3>
                        <p className="text-gray-300 text-sm mt-1">A IA está aumentando a qualidade da sua imagem.</p>
                    </div>
                )}
                
                {processedImage && originalImage ? (
                    <ImageCompare before={originalImage} after={processedImage} />
                ) : originalImage ? (
                    <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain"/>
                ) : (
                    <div className="w-full max-w-2xl text-center">
                         <div className="flex justify-center items-center">
                            <div className="w-20 h-20 bg-zinc-700 text-blue-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-800">
                                <Zap size={40} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Upscaler de Fotos com IA</h2>
                        <p className="text-gray-400 mb-6">Aumente e aprimore fotos automaticamente com um clique.</p>
                        <div className="flex justify-center my-4">
                            <button onClick={() => inputRef.current?.click()} className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 flex items-center gap-2">
                                <Upload size={20} /> Carregar Imagem
                            </button>
                        </div>
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
                    <div className="max-w-xl mx-auto flex items-center justify-center gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-2 text-center text-gray-300">Fator de Aumento</h4>
                            <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-md">
                                <button onClick={() => handleRescale(2)} className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${scale === 2 ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>2x</button>
                                <button onClick={() => handleRescale(4)} className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${scale === 4 ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>4x</button>
                            </div>
                        </div>
                        {processedImage && (
                            <>
                                <div className="w-px h-12 bg-gray-700"></div>
                                <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                    <Edit size={18} /> Editar
                                </button>
                                <button onClick={handleDownload} className="bg-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <Download size={18} /> Baixar
                                </button>
                            </>
                        )}
                    </div>
                )}
            </footer>
        </div>
    );
};
