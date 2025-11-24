
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Upload, Download, RefreshCw, Sliders, Palette, Paintbrush, Users, Plus, X, ImageIcon, Save, Trash2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { portraitStyles, portraitPrompts, twdCharacters, twdScenarios, stitchTemplates } from '../../data/portraitStyles';
import { fileToBlobUrl } from '../../utils/fileUtils';
import { useAiGeneration } from '../../hooks/useAiGeneration';

// --- DATA ---
const styleCategories = ['Todos', 'Estúdio', 'Externo', 'Interno', 'Criativo'];

const photoRequirements = {
    good: {
        url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop&q=80',
        text: 'Uma pessoa, de frente, com fundo limpo.'
    },
    bad: [
        { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop&q=80', text: 'Foto de corpo' },
        { url: 'https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=100&h=100&fit=crop&q=80', text: 'Rosto coberto' },
        { url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=100&h=100&fit=crop&q=80', text: 'Rosto de lado' },
        { url: 'https://images.unsplash.com/photo-1527515637462-c0b1a3212130?w=100&h=100&fit=crop&q=80', text: 'Foto em grupo' }
    ]
};

const DETAIL_LEVELS = ['Padrão', 'Alto', 'Ultra (8K)'];
const COLOR_PALETTES = ['Natural', 'Vívido', 'Cinematográfico', 'Preto e Branco', 'Quente', 'Frio'];
const ARTISTIC_FILTERS = ['Nenhum', 'Pintura a Óleo', 'Aquarela', 'Cyberpunk', 'Esboço', 'Renderização 3D'];

interface TwdPreset {
    name: string;
    characters: string[];
    scenario: string;
    subjects?: string[];
}

// --- SUB-COMPONENTS ---
const StyleCard: React.FC<{ style: any; isSelected: boolean; onSelect: (id: string) => void; }> = ({ style, isSelected, onSelect }) => (
    <div className="relative cursor-pointer group" onClick={() => onSelect(style.id)}>
        <img src={style.imageUrl} alt={style.name} className={`w-full h-auto aspect-square object-cover rounded-lg transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : 'group-hover:opacity-80'}`} loading="lazy" decoding="async" />
        {isSelected && <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#111317]"><Check size={12} className="text-white" /></div>}
        {style.isFree && <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">GRÁTIS</div>}
        {style.isNew && <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg animate-pulse">NOVO</div>}
        <p className="text-xs text-center mt-2 text-gray-300 group-hover:text-white">{style.name}</p>
    </div>
);

const PhotoRequirementItem: React.FC<{ url: string; text: string; isGood: boolean; }> = ({ url, text, isGood }) => (
    <div className="relative">
        <img src={url} alt={text} className="w-full aspect-square object-cover rounded-md" loading="lazy" decoding="async" />
        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${isGood ? 'bg-green-500' : 'bg-red-500'}`}>
            {isGood ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
        </div>
        <p className={`text-center text-xs mt-1 ${isGood ? 'text-gray-300' : 'text-red-400'}`}>{text}</p>
    </div>
);

const ImageCompare: React.FC<{ before: string; after: string }> = ({ before, after }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const handleMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    };
    return (
        <div className="relative w-full max-w-4xl mx-auto aspect-square rounded-lg overflow-hidden select-none shadow-lg" onMouseMove={handleMove}>
            <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src={before} alt="Antes" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <div className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize" style={{ left: `calc(${sliderPos}% - 2px)` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white shadow-md grid place-items-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
             <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</div>
             <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Gerado</div>
        </div>
    );
};

// --- MAIN COMPONENT ---
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
    const [customPrompt, setCustomPrompt] = useState('');
    const [userNotes, setUserNotes] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const inputRef = useRef<HTMLInputElement>(null);

    // Advanced Settings
    const [detailLevel, setDetailLevel] = useState('Padrão');
    const [colorPalette, setColorPalette] = useState('Natural');
    const [artisticFilter, setArtisticFilter] = useState('Nenhum');

    // Manual Group Detection Settings
    const [isManualMode, setIsManualMode] = useState(false);
    const [peopleCount, setPeopleCount] = useState(1);

    // TWD Logic
    const [twdSelectedChars, setTwdSelectedChars] = useState<string[]>([]);
    const [twdSelectedScenario, setTwdSelectedScenario] = useState<string>('');
    const [twdPresets, setTwdPresets] = useState<TwdPreset[]>(() => {
        const saved = localStorage.getItem('twdPresets');
        return saved ? JSON.parse(saved) : [];
    });
    const [facesMap, setFacesMap] = useState<string[]>([]);
    const [newFaceInput, setNewFaceInput] = useState('');

    // Stitch Logic
    const [selectedStitchTemplate, setSelectedStitchTemplate] = useState<string | null>(null);
    const [customStitchScene, setCustomStitchScene] = useState<string | null>(null);
    const stitchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialImage) setUploadedImage(initialImage);
    }, [initialImage, setUploadedImage]);

    useEffect(() => {
        if (generatedImage) {
            setStep(3);
        }
    }, [generatedImage]);

    // Auto-select first stitch template if none selected
    useEffect(() => {
        if (selectedStyle === 'stitch' && !selectedStitchTemplate && !customStitchScene) {
            setSelectedStitchTemplate(stitchTemplates[0]);
        }
    }, [selectedStyle]);

    const handleGenerateClick = async () => {
        if (!uploadedImage || !selectedStyle) return;

        let detectionInstruction = `
            SYSTEM INSTRUCTION: MULTI-FACE DETECTION MODE.
            1. Scan the image deeply to identify EVERY person present.
            2. Count the subjects.
            3. Apply the style to EACH detected person.
        `;
        
        if (isManualMode) {
            detectionInstruction = `
            SYSTEM OVERRIDE: MANUAL DETECTION.
            User specifies ${peopleCount} people.
            FIND and PROCESS exactly ${peopleCount} faces.
            ${userNotes ? `User Location Guide: ${userNotes}` : ''}
            `;
        }

        let styleInstruction = portraitPrompts[selectedStyle] || 'Retrato profissional.';
        let additionalImages: string[] = [];
        let imageOverride: string | undefined = undefined;
        let modelOverride: string | undefined = undefined;

        // --- LOGIC BY STYLE ---
        if (selectedStyle === 'custom') {
            styleInstruction = customPrompt;
        } else if (selectedStyle === 'walkingdead') {
            styleInstruction = `
                TWD VFX SCENE.
                Survivors (Source Image): ${facesMap.length ? facesMap.join(", ") : "All original subjects in the photo"}. 
                ACTION: Transform ALL detected people into survivors. KEEP FACES 100% IDENTICAL.
                Squad (TV Characters): ${twdSelectedChars.join(", ") || "Rick, Daryl"}. 
                Location: ${twdSelectedScenario || "Ruins"}.
                Mood: Cinematic, gritty, 8k.
            `;
        } else if (selectedStyle === 'stitch') {
            // LÓGICA DE TROCA DE IDENTIDADE (SWAP)
            const sceneToUse = customStitchScene || selectedStitchTemplate || stitchTemplates[0];
            // Use Nano Banana Pro for Stitch if possible
            modelOverride = 'gemini-3-pro-image-preview';
            
            if (sceneToUse && uploadedImage) {
                // INVERTE AS IMAGENS:
                // Imagem Principal = CENA (Template) -> Para manter o Stitch e o fundo intactos
                // Imagem Adicional = USUÁRIO (Referência) -> Para pegar o rosto
                imageOverride = sceneToUse; 
                additionalImages.push(uploadedImage);

                styleInstruction = `
                    PERFORM A HIGH-FIDELITY IDENTITY INSERTION (VFX).
                    
                    INPUTS:
                    1. MAIN IMAGE (Scene): A scene with Stitch and a human. DO NOT CHANGE THE SCENE.
                    2. REFERENCE IMAGE (Identity): A photo of a user.
                    
                    TASK:
                    - Replace the human subject in the MAIN IMAGE with the identity from the REFERENCE IMAGE.
                    - MATCH lighting, skin tone, noise, and shadows of the MAIN IMAGE perfectly.
                    - GENERATE realistic occlusion shadows where Stitch touches the person.
                    
                    CONSTRAINTS:
                    - PRESERVE STITCH (Blue Alien) 100% EXACTLY AS IS.
                    - PRESERVE BACKGROUND 100% EXACTLY AS IS.
                    - ONLY CHANGE THE HUMAN'S FACE/BODY FEATURES TO MATCH REFERENCE.
                `;
            } else {
                styleInstruction = portraitPrompts['stitch'];
            }
        }

        // --- ADVANCED SETTINGS ---
        let settings = "";
        if (artisticFilter !== 'Nenhum') settings += ` Style Overlay: ${artisticFilter}.`;
        if (detailLevel !== 'Padrão') settings += ` Detail Level: ${detailLevel}.`;
        if (colorPalette !== 'Natural') settings += ` Color Palette: ${colorPalette}.`;

        const finalPrompt = `${styleInstruction}\n\nSETTINGS: ${settings}\n\n${userNotes && !isManualMode ? `USER NOTES: ${userNotes}` : ''}`;
        
        await generate(finalPrompt, { 
            systemInstruction: detectionInstruction,
            additionalImages: additionalImages,
            imageOverride: imageOverride,
            model: modelOverride
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleStitchSceneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const url = fileToBlobUrl(e.target.files[0]);
            setCustomStitchScene(url);
            setSelectedStitchTemplate(null);
        }
    };

    const handleCreateNew = () => {
        setStep(1);
        reset();
        setSelectedStyle(null);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        fetch(generatedImage)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `retrato-ia-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error("Download failed", err));
    };

    const handleBack = () => {
        if (step === 3) setStep(2);
        else if (step === 2) setStep(1);
        else onBack();
    };

    // TWD Helper Functions
    const handleAddFace = () => { if(newFaceInput.trim()) { setFacesMap(p => [...p, newFaceInput]); setNewFaceInput(''); }};
    const handleRemoveFace = (i:number) => setFacesMap(p => p.filter((_,idx)=>idx!==i));
    const toggleTwdCharacter = (char: string) => setTwdSelectedChars(p => p.includes(char) ? p.filter(c=>c!==char) : [...p, char]);
    
    const handleSaveTwdPreset = () => {
        const name = window.prompt("Nomeie sua configuração:");
        if (!name) return;
        const newPreset: TwdPreset = { name, characters: twdSelectedChars, scenario: twdSelectedScenario, subjects: facesMap };
        const updated = [...twdPresets, newPreset];
        setTwdPresets(updated);
        localStorage.setItem('twdPresets', JSON.stringify(updated));
    };
    const handleLoadTwdPreset = (p: TwdPreset) => {
        setTwdSelectedChars(p.characters);
        setTwdSelectedScenario(p.scenario);
        if(p.subjects) setFacesMap(p.subjects);
    };
    const handleDeleteTwdPreset = (idx: number) => {
        const updated = twdPresets.filter((_, i) => i !== idx);
        setTwdPresets(updated);
        localStorage.setItem('twdPresets', JSON.stringify(updated));
    };

    const filteredStyles = activeCategory === 'Todos' ? portraitStyles : portraitStyles.filter(s => s.category === activeCategory);

    return (
        <div className="flex flex-col h-screen bg-[#111317] text-white overflow-hidden relative">
            {isGenerating && (
                 <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <h3 className="text-white font-semibold text-lg">Gerando Retrato IA...</h3>
                    <p className="text-gray-400 text-sm mt-2">Processando imagem...</p>
                </div>
            )}
            
            <header className="flex-shrink-0 flex items-center justify-between px-6 h-16 bg-[#1a1c20] border-b border-gray-800">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-300 hover:text-white">
                    <ArrowLeft size={20} /> <span className="text-sm">Voltar</span>
                </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8">
                {step === 1 && (
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold">Selecione o Estilo</h1>
                            <div className="flex justify-center gap-2 mt-4">
                                {styleCategories.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold ${activeCategory === cat ? 'bg-white text-black' : 'bg-[#2a2d33]'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                            {filteredStyles.map(s => (
                                <StyleCard key={s.id} style={s} isSelected={selectedStyle === s.id} onSelect={setSelectedStyle} />
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                     <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-[#1a1c20] p-4 rounded-lg border border-gray-700">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><Sliders size={16}/> Configurações</h3>
                                
                                {/* CONFIGURAÇÃO DE DETECÇÃO DE GRUPO */}
                                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-900/50 rounded">
                                    <div 
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => setIsManualMode(!isManualMode)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-blue-400"/>
                                            <span className="text-sm font-semibold text-blue-100">Detecção de Grupo</span>
                                        </div>
                                        {isManualMode ? <CheckSquare size={18} className="text-blue-400"/> : <Square size={18} className="text-gray-500"/>}
                                    </div>
                                    
                                    {isManualMode && (
                                        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                                            <div>
                                                <label className="text-xs text-blue-200 block mb-1">Quantas pessoas?</label>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="bg-[#2a2d33] px-2 py-1 rounded hover:bg-[#3a3d43]">-</button>
                                                    <span className="font-mono w-8 text-center text-sm">{peopleCount}</span>
                                                    <button onClick={() => setPeopleCount(peopleCount + 1)} className="bg-[#2a2d33] px-2 py-1 rounded hover:bg-[#3a3d43]">+</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-blue-200 block mb-1">Descrição (Opcional)</label>
                                                <textarea 
                                                    value={userNotes} 
                                                    onChange={e => setUserNotes(e.target.value)} 
                                                    placeholder="Ex: Homem de barba à esquerda, Mulher loira no centro..." 
                                                    className="w-full h-16 bg-[#2a2d33] p-2 rounded text-xs border border-gray-600 focus:border-blue-500 outline-none resize-none" 
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Ajude a IA a encontrar todos se a detecção automática falhar.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CONFIGURAÇÃO STITCH & VOCÊ */}
                                {selectedStyle === 'stitch' && (
                                    <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-900/50 rounded space-y-3">
                                        <h4 className="text-sm font-bold text-indigo-300 mb-2">Escolha a Cena Base</h4>
                                        
                                        {/* Botão de Upload de Cena Personalizada */}
                                        <div className="mb-3">
                                            <input type="file" ref={stitchInputRef} onChange={handleStitchSceneUpload} accept="image/*" className="hidden" />
                                            <button 
                                                onClick={() => stitchInputRef.current?.click()}
                                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <ImageIcon size={14} />
                                                {customStitchScene ? 'Trocar Cena Personalizada' : 'Carregar Cena Própria'}
                                            </button>
                                            {customStitchScene && (
                                                <div className="mt-2 relative inline-block group">
                                                    <img src={customStitchScene} className="h-20 w-auto rounded border border-indigo-500" alt="Cena Personalizada" />
                                                    <button 
                                                        onClick={() => setCustomStitchScene(null)}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                    <span className="text-[10px] text-indigo-300 block mt-1">Sua cena carregada</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Templates Pré-definidos */}
                                        {!customStitchScene && (
                                            <>
                                                <p className="text-xs text-gray-400">Ou escolha um modelo:</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {stitchTemplates.map((template, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setSelectedStitchTemplate(template)}
                                                            className={`relative aspect-[9/16] rounded overflow-hidden cursor-pointer border-2 ${selectedStitchTemplate === template ? 'border-indigo-500' : 'border-transparent hover:border-gray-600'}`}
                                                        >
                                                            <img src={template} className="w-full h-full object-cover" loading="lazy" />
                                                            {selectedStitchTemplate === template && <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center"><Check size={20} className="text-white drop-shadow-md"/></div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400">Nível de Detalhe</label>
                                        <select value={detailLevel} onChange={e => setDetailLevel(e.target.value)} className="w-full bg-[#2a2d33] p-2 rounded text-sm"><option>Padrão</option><option>Alto</option><option>Ultra (8K)</option></select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Paleta de Cores</label>
                                        <select value={colorPalette} onChange={e => setColorPalette(e.target.value)} className="w-full bg-[#2a2d33] p-2 rounded text-sm">{COLOR_PALETTES.map(p=><option key={p}>{p}</option>)}</select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Filtro Artístico</label>
                                        <select value={artisticFilter} onChange={e => setArtisticFilter(e.target.value)} className="w-full bg-[#2a2d33] p-2 rounded text-sm">{ARTISTIC_FILTERS.map(f=><option key={f}>{f}</option>)}</select>
                                    </div>
                                </div>
                                
                                {selectedStyle === 'walkingdead' && (
                                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-red-300 font-bold">Configuração TWD</p>
                                            <button onClick={handleSaveTwdPreset} className="text-[10px] flex items-center gap-1 bg-red-900/40 px-2 py-1 rounded text-red-300"><Save size={12}/> Salvar</button>
                                        </div>
                                        <select value={twdSelectedScenario} onChange={e => setTwdSelectedScenario(e.target.value)} className="w-full bg-[#2a2d33] p-2 rounded text-sm mb-2">
                                            <option value="">Selecione um Cenário...</option>
                                            {twdScenarios.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                        <div className="flex gap-1">
                                            <input value={newFaceInput} onChange={e=>setNewFaceInput(e.target.value)} placeholder="Quem está na foto?" className="flex-1 bg-[#2a2d33] p-1 rounded text-xs" />
                                            <button onClick={handleAddFace} className="bg-red-600 px-2 rounded"><Plus size={14}/></button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">{facesMap.map((f,i)=><span key={i} className="bg-red-800 text-xs px-1 rounded flex items-center gap-1">{f}<X size={10} onClick={()=>handleRemoveFace(i)}/></span>)}</div>
                                        
                                        {twdPresets.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mt-2">
                                                {twdPresets.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-gray-700 text-[10px]">
                                                        <button onClick={() => handleLoadTwdPreset(p)} className="text-white hover:text-red-400">{p.name}</button>
                                                        <button onClick={() => handleDeleteTwdPreset(idx)} className="text-gray-500 hover:text-red-500"><Trash2 size={10}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-400 mt-2 max-h-24 overflow-y-auto">Personagens (Selecione): <br/> {twdCharacters.map(c=><span key={c} onClick={()=>toggleTwdCharacter(c)} className={`cursor-pointer mr-2 inline-block ${twdSelectedChars.includes(c)?'text-red-400 font-bold':'text-gray-500'}`}>{c}</span>)}</div>
                                    </div>
                                )}
                                
                                {selectedStyle === 'custom' && (
                                    <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Seu prompt..." className="w-full h-20 bg-[#2a2d33] mt-2 p-2 rounded text-sm" />
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-[#1a1c20] p-6 rounded-lg flex flex-col items-center">
                            <div className="w-full aspect-square bg-[#2a2d33] rounded-lg overflow-hidden mb-4 flex items-center justify-center relative">
                                {uploadedImage ? <img src={uploadedImage} className="w-full h-full object-cover" /> : <p className="text-gray-500">Nenhuma foto</p>}
                            </div>
                            <input type="file" ref={inputRef} onChange={onFileChange} className="hidden" />
                            <button onClick={() => inputRef.current?.click()} className="bg-blue-600 px-6 py-2 rounded-full font-bold flex items-center gap-2">
                                <Upload size={18}/> {uploadedImage ? 'Trocar Foto' : 'Carregar Foto'}
                            </button>
                            {error && <div className="text-red-400 text-xs mt-2 text-center bg-red-900/20 p-2 rounded border border-red-900/50 flex items-center gap-2 justify-center"><AlertCircle size={14}/> {error}</div>}
                            
                            <div className="mt-4 w-full">
                                <h3 className="font-semibold text-lg mb-2 text-left">Requisitos</h3>
                                <div className="bg-[#1a1c20] p-2 rounded-lg">
                                    <PhotoRequirementItem {...photoRequirements.good} isGood={true}/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {step === 3 && generatedImage && uploadedImage && (
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-2xl font-bold mb-6">Resultado</h1>
                        <ImageCompare before={uploadedImage} after={generatedImage} />
                        <div className="flex justify-center gap-4 mt-8">
                            <button onClick={handleCreateNew} className="bg-[#2a2d33] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#3a3d43]"><RefreshCw size={18}/> Novo</button>
                            <button onClick={handleDownload} className="bg-green-600 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-700"><Download size={18}/> Baixar</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex justify-center bg-gradient-to-t from-[#111317] to-transparent sticky bottom-0">
                {step === 1 && <button onClick={() => setStep(2)} disabled={!selectedStyle} className="bg-blue-600 px-8 py-3 rounded-full font-bold disabled:opacity-50">Continuar</button>}
                {step === 2 && <button onClick={handleGenerateClick} disabled={!uploadedImage || isGenerating} className="bg-blue-600 px-8 py-3 rounded-full font-bold disabled:opacity-50 w-48 flex justify-center">{isGenerating ? 'Processando...' : 'Gerar Retrato'}</button>}
            </div>
        </div>
    );
};
