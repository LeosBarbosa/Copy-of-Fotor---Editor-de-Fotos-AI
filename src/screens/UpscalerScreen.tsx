import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Zap, Edit, ZoomIn, Info, AlertCircle } from 'lucide-react';
import { useAiGeneration } from '../hooks/useAiGeneration.ts';
import { ImageCompareSlider } from '../components/ImageCompareSlider.tsx';

const sampleImages = [
    { name: 'Retrato Baixa Res', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=150&fit=crop' },
    { name: 'Paisagem Turva', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=150&h=100&fit=crop' },
];

export const UpscalerScreen: React.FC<{ 
    onBack: () => void; 
    onEdit: (imageUrl: string) => void; 
    initialImage?: string | null; 
}> = ({ onBack, onEdit, initialImage }) => {
    const { 
        originalImage, 
        processedImage, 
        isProcessing, 
        error, 
        setOriginalImage, 
        handleImageUpload, 
        generate, 
        reset 
    } = useAiGeneration(initialImage);

    const [upscaleType, setUpscaleType] = useState<'Standard' | 'Ultra'>('Standard');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpscale = async () => {
        if (!originalImage) return;

        const prompt = upscaleType === 'Ultra' 
            ? "Perform a high-end AI upscaling and super-resolution. Reconstruct missing details, remove all compression artifacts and noise, and sharpen edges. Output a crystal clear 4K version of this image while maintaining 100% fidelity to the original subject."
            : "Enlarge and enhance this image. Improve clarity, reduce blur, and make details sharper and cleaner. Maintain a natural look.";

        await generate(prompt, { 
            model: 'gemini-2.5-flash-image' 
        });
    };

    useEffect(() => {
        if (initialImage && !processedImage && !isProcessing) {
            // Optional: Auto-process if coming from editor
        }
    }, [initialImage, processedImage, isProcessing]);

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `fotor-upscaled-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="flex flex-col h-screen bg-[#111317] text-white overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between px-6 h-16 bg-[#1a1c20] border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <Zap size={18} className="text-yellow-400" />
                        Upscaler de IA
                    </h1>
                </div>
                {processedImage && (
                    <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all">
                        <Download size={16} /> Baixar HD
                    </button>
                )}
            </header>

            <main className="flex-1 min-h-0 relative flex items-center justify-center p-6 bg-checkered">
                {isProcessing && (
                    <div className="absolute inset-0 bg-[#111317]/80 z-50 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-xl font-bold">Aprimorando Pixels...</h3>
                        <p className="text-gray-400 text-sm mt-2">A IA está reconstruindo detalhes em alta definição.</p>
                    </div>
                )}

                {processedImage && originalImage ? (
                    <div className="w-full h-full max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-[#1a1c20]">
                        <ImageCompareSlider 
                            beforeSrc={originalImage} 
                            afterSrc={processedImage} 
                            afterStyle={{}} 
                            onLoad={() => {}} 
                        />
                    </div>
                ) : originalImage ? (
                    <div className="relative max-w-full max-h-full group">
                        <img src={originalImage} className="max-w-full max-h-full object-contain rounded-lg shadow-xl" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black font-bold px-6 py-2 rounded-full text-xs">Trocar Imagem</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center max-w-xl p-10 bg-[#1a1c20] rounded-3xl border border-gray-800 shadow-2xl">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30">
                            <Zap size={40} className="text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-black mb-3">Super Resolução com IA</h2>
                        <p className="text-gray-400 mb-8">Aumente o tamanho de fotos pequenas ou borradas sem perder a qualidade.</p>
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 mx-auto transition-transform hover:scale-105 shadow-lg shadow-blue-900/20"
                        >
                            <Upload size={20} /> Carregar Foto
                        </button>

                        <div className="mt-10">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Ou tente um exemplo</p>
                            <div className="flex justify-center gap-4">
                                {sampleImages.map((img, i) => (
                                    <button key={i} onClick={() => setOriginalImage(img.url)} className="group relative w-24 h-24 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
                                        <img src={img.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" alt="Exemplo" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            </main>

            <footer className="flex-shrink-0 p-6 bg-[#1a1c20] border-t border-gray-800">
                {error && (
                    <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 justify-center">
                        <AlertCircle size={14}/> {error}
                    </div>
                )}
                
                {originalImage && (
                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 flex gap-2 w-full">
                            <button 
                                onClick={() => setUpscaleType('Standard')}
                                className={`flex-1 p-3 rounded-xl border transition-all text-left ${upscaleType === 'Standard' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-[#111317] border-gray-700 text-gray-500 hover:border-gray-500'}`}
                            >
                                <p className="text-xs font-bold uppercase">Padrão</p>
                                <p className="text-[10px] opacity-70">Melhoria equilibrada</p>
                            </button>
                            <button 
                                onClick={() => setUpscaleType('Ultra')}
                                className={`flex-1 p-3 rounded-xl border transition-all text-left ${upscaleType === 'Ultra' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-[#111317] border-gray-700 text-gray-500 hover:border-gray-500'}`}
                            >
                                <p className="text-xs font-bold uppercase">Ultra 4K</p>
                                <p className="text-[10px] opacity-70">Máximo detalhe</p>
                            </button>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={handleUpscale} 
                                disabled={isProcessing}
                                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold disabled:opacity-30 shadow-lg shadow-blue-900/20"
                            >
                                {processedImage ? 'Refazer Upscale' : 'Aprimorar Agora'}
                            </button>
                            {processedImage && (
                                <button onClick={() => onEdit(processedImage)} className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl border border-gray-700 transition-colors">
                                    <Edit size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};