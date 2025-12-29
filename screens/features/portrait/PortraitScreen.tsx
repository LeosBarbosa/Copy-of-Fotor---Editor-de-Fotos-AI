import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Upload, Download, RefreshCw, Sliders, Users, ImageIcon, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { portraitStyles, portraitPrompts } from '../../../data/portraitStyles';
import { fileToBlobUrl } from '../../../utils/fileUtils';
import { useAiGeneration } from '../../../hooks/useAiGeneration';

const styleCategories = ['Todos', 'Estúdio', 'Externo', 'Criativo'];

const StyleCard: React.FC<{ style: any; isSelected: boolean; onSelect: (id: string) => void; }> = ({ style, isSelected, onSelect }) => (
    <div className="relative cursor-pointer group" onClick={() => onSelect(style.id)}>
        <img src={style.imageUrl} alt={style.name} className={`w-full aspect-square object-cover rounded-lg transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-500 scale-95' : 'group-hover:opacity-80'}`} />
        {isSelected && <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#111317]"><Check size={14} className="text-white" /></div>}
        {style.isNew && <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">NOVO</div>}
        <p className="text-[11px] text-center mt-2 text-gray-400 group-hover:text-white font-medium">{style.name}</p>
    </div>
);

export const PortraitScreen: React.FC<{ onBack: () => void; initialImage?: string | null }> = ({ onBack, initialImage }) => {
    const { 
        originalImage: uploadedImage, 
        processedImage: generatedImage, 
        isProcessing: isGenerating, 
        error, 
        setOriginalImage: setUploadedImage, 
        handleImageUpload, 
        generate, 
        reset 
    } = useAiGeneration(initialImage);

    const [step, setStep] = useState(1);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [isManualMode, setIsManualMode] = useState(false);
    const [peopleCount, setPeopleCount] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (generatedImage) setStep(3); }, [generatedImage]);

    const handleGenerateClick = async () => {
        if (!uploadedImage || !selectedStyle) return;

        let styleInstruction = portraitPrompts[selectedStyle] || 'Professional portrait.';
        const model = selectedStyle === 'crosshatch' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

        const systemInstruction = isManualMode 
            ? `MANUAL DETECTION: Find exactly ${peopleCount} faces and apply style to each.`
            : `AUTO DETECTION: Apply style to every person identified in the image.`;

        await generate(styleInstruction, { 
            systemInstruction,
            model 
        });
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `fotor-ai-portrait-${Date.now()}.jpg`;
        link.click();
    };

    const filteredStyles = activeCategory === 'Todos' ? portraitStyles : portraitStyles.filter(s => s.category === activeCategory);

    return (
        <div className="flex flex-col h-screen bg-[#111317] text-white overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between px-6 h-16 bg-[#1a1c20] border-b border-gray-800">
                <button onClick={() => step === 1 ? onBack() : setStep(step - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} /> <span className="text-sm font-semibold">Voltar</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 md:p-10">
                {step === 1 && (
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black tracking-tighter mb-4">ESTILO DE RETRATO</h1>
                            <p className="text-gray-500 text-sm mb-6">Escolha uma estética para transformar sua foto</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                                {styleCategories.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-white text-black shadow-lg' : 'bg-[#2a2d33] text-gray-400 hover:text-white'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {filteredStyles.map(s => (
                                <StyleCard key={s.id} style={s} isSelected={selectedStyle === s.id} onSelect={setSelectedStyle} />
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-gray-800 shadow-xl">
                                <h3 className="font-bold mb-6 flex items-center gap-2 text-blue-400"><Sliders size={18}/> Ajustes da IA</h3>
                                
                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-6">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsManualMode(!isManualMode)}>
                                        <div className="flex items-center gap-3">
                                            <Users size={18} className="text-blue-400"/>
                                            <span className="text-sm font-bold">Detecção de Grupo</span>
                                        </div>
                                        {isManualMode ? <CheckSquare size={20} className="text-blue-500"/> : <Square size={20} className="text-gray-600"/>}
                                    </div>
                                    {isManualMode && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Pessoas na foto</label>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="w-8 h-8 bg-[#2a2d33] rounded-full flex items-center justify-center">-</button>
                                                <span className="font-mono text-xl">{peopleCount}</span>
                                                <button onClick={() => setPeopleCount(peopleCount + 1)} className="w-8 h-8 bg-[#2a2d33] rounded-full flex items-center justify-center">+</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                            <div className="w-full aspect-[3/4] bg-[#1a1c20] rounded-2xl overflow-hidden mb-6 border border-gray-800 shadow-2xl flex items-center justify-center relative group">
                                {uploadedImage ? (
                                    <img src={uploadedImage} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="text-center p-10">
                                        <ImageIcon size={48} className="mx-auto text-gray-700 mb-4" />
                                        <p className="text-gray-600 text-xs">Nenhuma foto carregada</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => inputRef.current?.click()} className="bg-white text-black font-bold px-6 py-2 rounded-full text-xs">Alterar Foto</button>
                                </div>
                            </div>
                            <input type="file" ref={inputRef} onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="hidden" accept="image/*" />
                            {!uploadedImage && (
                                <button onClick={() => inputRef.current?.click()} className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                                    <Upload size={18}/> Carregar sua Foto
                                </button>
                            )}
                            {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
                        </div>
                    </div>
                )}
                
                {step === 3 && generatedImage && (
                    <div className="max-w-3xl mx-auto text-center animate-in zoom-in-95 duration-500">
                        <h1 className="text-2xl font-black mb-8">SUA ARTE ESTÁ PRONTA</h1>
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                            <img src={generatedImage} alt="Resultado" className="w-full h-auto" />
                        </div>
                        <div className="flex justify-center gap-4 mt-10">
                            <button onClick={reset} className="bg-[#1a1c20] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2a2d33] transition-all border border-gray-800"><RefreshCw size={18}/> Novo Retrato</button>
                            <button onClick={handleDownload} className="bg-green-600 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"><Download size={18}/> Baixar Imagem</button>
                        </div>
                    </div>
                )}
            </main>

            {step < 3 && (
                <div className="p-6 bg-[#111317] border-t border-gray-800 flex justify-center">
                    {step === 1 && (
                        <button onClick={() => setStep(2)} disabled={!selectedStyle} className="w-full max-w-xs bg-blue-600 py-4 rounded-xl font-bold disabled:opacity-30 shadow-lg shadow-blue-900/20">Continuar para Upload</button>
                    )}
                    {step === 2 && (
                        <button onClick={handleGenerateClick} disabled={!uploadedImage || isGenerating} className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-xl font-bold disabled:opacity-30 flex items-center justify-center gap-3">
                            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'GERAR COM IA'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};