
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Upload, Download, RefreshCw, Sliders, Users, ImageIcon, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { portraitStyles, portraitPrompts } from '../data/portraitStyles';
import { fileToBlobUrl } from '../utils/fileUtils';
import { useAiGeneration } from '../hooks/useAiGeneration';

export const PortraitScreen: React.FC<{ onBack: () => void; initialImage?: string | null }> = ({ onBack, initialImage }) => {
    const { 
        originalImage: uploadedImage, 
        processedImage: generatedImage, 
        isProcessing: isGenerating, 
        error, 
        handleImageUpload, 
        generate, 
        reset 
    } = useAiGeneration(initialImage);

    const [step, setStep] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [peopleCount, setPeopleCount] = useState(1);
    const [isManualMode, setIsManualMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (generatedImage) setStep(3); }, [generatedImage]);

    const handleGenerateClick = async () => {
        if (!uploadedImage || !selectedStyle) return;
        const styleInstruction = portraitPrompts[selectedStyle] || 'Professional portrait.';
        const model = selectedStyle === 'crosshatch' ? 'pro' : 'standard';

        await generate(styleInstruction, { 
            systemInstruction: isManualMode ? `Process ${peopleCount} faces.` : `Auto detect faces.`,
            model 
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#111317] text-white">
            <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-[#1a1c20]">
                <button onClick={() => step === 1 ? onBack() : setStep(step - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={20} /> <span>Voltar</span>
                </button>
                <div className="font-bold text-blue-400">FOTOR AI PRO</div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                {step === 1 && (
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Escolha seu Estilo</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {portraitStyles.map(s => (
                                <div key={s.id} onClick={() => setSelectedStyle(s.id)} className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${selectedStyle === s.id ? 'border-blue-500 scale-95 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                                    <img src={s.imageUrl} alt={s.name} className="w-full aspect-square object-cover" />
                                    <p className="p-2 text-center text-[10px] font-bold uppercase">{s.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 flex justify-center">
                            <button onClick={() => setStep(2)} disabled={!selectedStyle} className="bg-blue-600 px-12 py-4 rounded-full font-black hover:bg-blue-700 disabled:opacity-30">AVANÇAR</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-600 relative group">
                            {uploadedImage ? <img src={uploadedImage} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-600"/>}
                            <input type="file" ref={inputRef} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" accept="image/*" />
                            <button onClick={() => inputRef.current?.click()} className="absolute bg-white text-black px-4 py-2 rounded-full font-bold text-xs">Carregar Foto</button>
                        </div>
                        <button onClick={handleGenerateClick} disabled={!uploadedImage || isGenerating} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-3">
                            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'GERAR ARTE IA'}
                        </button>
                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
                    </div>
                )}

                {step === 3 && generatedImage && (
                    <div className="max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <img src={generatedImage} className="w-full rounded-3xl shadow-2xl border border-gray-800" />
                        <div className="flex gap-4 justify-center">
                            <button onClick={reset} className="bg-gray-800 px-8 py-4 rounded-xl font-bold">Novo</button>
                            <a href={generatedImage} download="fotor-ai.jpg" className="bg-green-600 px-8 py-4 rounded-xl font-bold flex items-center gap-2"><Download size={18}/> Baixar</a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
