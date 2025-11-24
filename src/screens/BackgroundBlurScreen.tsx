
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, CircleDot, Edit } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const sampleImages = [
    { name: 'Retrato', url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=300&fit=crop' },
    { name: 'Animal', url: 'https://images.unsplash.com/photo-1583337130417-2346a5be24c1?w=200&h=300&fit=crop' },
];

const Header: React.FC<{ onBack: () => void; }> = ({ onBack }) => (
    <header className="flex-shrink-0 bg-[#2c2c2c] text-white flex items-center justify-between px-4 h-14 border-b border-gray-700/50 z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-semibold text-lg">Desfocar Fundo IA</h1>
        </div>
    </header>
);

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
        <div ref={containerRef} className="relative w-full h-full" onMouseMove={handleMove}>
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

export const BackgroundBlurScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; }> = ({ onBack, onEdit }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [intensity, setIntensity] = useState(50);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleProcess = async () => {
        if (!originalImage) return;
        setIsProcessing(true);
        setError(null);
        try {
            const { base64, mimeType } = await imageUrlToBase64(originalImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Identifique o assunto principal nesta imagem e aplique um efeito de desfoque de fundo (bokeh) com uma intensidade de ${intensity}%. O assunto deve permanecer nítido e focado. A transição entre o assunto e o fundo desfocado deve ser suave e natural, como se fosse capturado por uma lente de câmera de alta qualidade.`;

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
            console.error("Erro no desfoque de fundo:", err);
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
        link.download = `fundo-desfocado-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderMainContent = () => {
        if (isProcessing) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <h3 className="text-white font-semibold text-lg">Aplicando desfoque...</h3>
                    <p className="text-gray-300 text-sm mt-1">A IA está criando o efeito de profundidade.</p>
                </div>
            );
        }
        if (processedImage && originalImage) {
            return <ImageCompare before={originalImage} after={processedImage} />;
        }
        if (originalImage) {
            return <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />;
        }
        return (
            <div className="w-full max-w-2xl text-center">
                <div className="flex justify-center items-center">
                    <div className="w-20 h-20 bg-zinc-700 text-blue-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-800">
                        <CircleDot size={40} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Desfocar Fundo com IA</h2>
                <p className="text-gray-400 mb-6">Crie um efeito de profundidade de campo profissional.</p>
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
        );
    };
    
    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <Header onBack={onBack} />
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 flex items-center justify-center p-8">
                    {renderMainContent()}
                </div>

                <div className="flex-shrink-0 z-10 p-4 bg-[#1F1F1F]/80">
                     {error && <div className="max-w-xl mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300">{error}</div>}
                     {originalImage && (
                        <div className="max-w-xl mx-auto flex items-center gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            <div className="flex-1">
                                <label htmlFor="intensity" className="text-sm font-semibold text-gray-300">Intensidade do Desfoque: {intensity}%</label>
                                <input id="intensity" type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full mt-2" />
                            </div>

                            <div className="w-px self-stretch bg-gray-700"></div>
                            
                            <div className="flex items-center gap-3">
                                <button onClick={handleProcess} disabled={isProcessing} className="bg-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
                                    {isProcessing ? '...' : 'Aplicar'}
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
                </div>
            </main>
        </div>
    );
};
