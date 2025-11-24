
import React, { useState, useRef } from 'react';
import { ArrowLeft, ChevronDown, Upload, Brush, Shirt, Scissors, X } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const presets = [
    { name: 'Conjunto de biquíni', imageUrl: 'https://images.unsplash.com/photo-1574312526341-a185b85e0586?w=200&h=200&fit=crop' },
    { name: 'Conjunto de jeans', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop' },
    { name: 'Terno', imageUrl: 'https://images.unsplash.com/photo-1594938382928-e87a2a1a45a3?w=200&h=200&fit=crop' },
    { name: 'Jaqueta de moto', imageUrl: 'https://images.unsplash.com/photo-1603563920979-fe33358ab4a6?w=200&h=200&fit=crop' },
];

const clothingTypes = [
    { id: 'full', label: 'Conjuntos completos', icon: Shirt },
    { id: 'top', label: 'Topo', icon: Shirt },
    { id: 'bottom', label: 'Partes de baixo', icon: Scissors },
];

interface UploadBoxProps {
    image: string | null;
    onClick: () => void;
    onRemove: () => void;
    placeholderText: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({ image, onClick, onRemove, placeholderText }) => (
    <div className="relative bg-gray-700/50 p-4 rounded-md text-center flex-1 aspect-square flex flex-col items-center justify-center cursor-pointer" onClick={onClick}>
        {image ? (
            <>
                <img src={image} alt="Roupa carregada" className="w-full h-full object-contain rounded-md" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/70"
                >
                    <X size={12} />
                </button>
            </>
        ) : (
            <>
                <div className="w-16 h-16 bg-gray-900/50 rounded-lg mx-auto flex items-center justify-center">
                    <Upload size={28} className="text-gray-500" />
                </div>
                <p className="text-xs mt-2 text-gray-400">{placeholderText}</p>
                <p className="text-[10px] text-gray-500 mt-1">Guia de upload</p>
            </>
        )}
    </div>
);


interface VirtualTryOnPanelProps {
    onBack: () => void;
    image: string | null;
    onApply: (newImage: string) => void;
}

export const VirtualTryOnPanel: React.FC<VirtualTryOnPanelProps> = ({ onBack, image, onApply }) => {
    const [prompt, setPrompt] = useState('');
    const [activeTab, setActiveTab] = useState('Carregar');
    const [clothingType, setClothingType] = useState(clothingTypes[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clothingImages, setClothingImages] = useState<(string | null)[]>([null, null]);

    const clothingInputRef1 = useRef<HTMLInputElement>(null);
    const clothingInputRef2 = useRef<HTMLInputElement>(null);

    const handleClothingFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImages = [...clothingImages];
                newImages[index] = e.target?.result as string;
                setClothingImages(newImages);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeClothingImage = (index: number) => {
        const newImages = [...clothingImages];
        newImages[index] = null;
        setClothingImages(newImages);
    };

    const handleGenerate = async () => {
        if (!image) {
            setError('Por favor, carregue uma imagem de uma pessoa primeiro.');
            return;
        }
        const hasClothingImage = clothingImages.some(img => img !== null);
        if (!prompt.trim() && !hasClothingImage) {
            setError('Por favor, descreva uma roupa ou carregue uma imagem de referência.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const { base64: personBase64, mimeType: personMimeType } = await imageUrlToBase64(image);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const parts: { inlineData?: { data: string; mimeType: string; }; text?: string; }[] = [
                { inlineData: { data: personBase64, mimeType: personMimeType } }
            ];
    
            let fullPrompt = `Faça um provador virtual. Substitua a roupa da pessoa na primeira imagem.`;
    
            if (prompt.trim()) {
                fullPrompt += ` Use a seguinte descrição como guia: "${prompt}".`;
            }
    
            const validClothingImages = clothingImages.filter(img => img !== null) as string[];
    
            if (validClothingImages.length > 0) {
                fullPrompt += ` Use a(s) imagem(ns) de roupa a seguir como referência visual principal.`;
                for (const clothingImg of validClothingImages) {
                    const partsArr = clothingImg.split(',');
                    const mimeType = partsArr[0].match(/:(.*?);/)?.[1];
                    const base64Data = partsArr[1];
                    if (mimeType && base64Data) {
                        parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                    }
                }
            }
            
            fullPrompt += ` O tipo de roupa é "${clothingType.label}". Não altere o rosto, cabelo, corpo ou fundo da pessoa. Apenas substitua as roupas que ela está vestindo atualmente de forma realista com base na(s) referência(s) fornecida(s).`
    
            parts.push({ text: fullPrompt });

            const response = await ai.models.generateContent({
              model: AI_IMAGE_MODEL,
              contents: { parts },
              config: {
                  responseModalities: [Modality.IMAGE],
              },
            });

            const candidate = response.candidates?.[0];
            const partsRes = candidate?.content?.parts || [];
            let newImageFound = false;

            for (const part of partsRes) {
              if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const newMimeType = part.inlineData.mimeType;
                const imageUrl = `data:${newMimeType};base64,${base64ImageBytes}`;
                onApply(imageUrl);
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
            console.error("Erro no provador virtual:", err);
            setError(err.message || "Falha ao gerar a imagem. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-[calc(100vw-5rem)] sm:w-80 bg-[#2c2c2c]/90 backdrop-blur-lg shadow-2xl text-white flex flex-col h-full flex-shrink-0 relative">
             {isGenerating && (
                <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center text-center p-4">
                    <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-white font-semibold text-lg">Criando seu novo visual...</h3>
                    <p className="text-gray-300 text-sm mt-1">A IA está vestindo seu modelo.</p>
                </div>
            )}
            <header className="flex items-center gap-4 p-4 border-b border-gray-700/50 flex-shrink-0">
                <button onClick={onBack} className="p-1 hover:bg-gray-700/50 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="font-semibold text-sm">Provador Virtual com IA</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex bg-gray-700/50 rounded-lg p-1 mb-4">
                    <button onClick={() => setActiveTab('Carregar')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'Carregar' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>Carregar</button>
                    <button onClick={() => setActiveTab('Predefinições')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'Predefinições' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>Predefinições</button>
                </div>

                <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600">
                        <div className="flex items-center gap-2">
                            <clothingType.icon size={18} className="text-blue-400"/>
                            <span className="text-sm">{clothingType.label}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#3a3a3a] border border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden">
                            {clothingTypes.map(type => (
                                <button key={type.id} onClick={() => { setClothingType(type); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 p-3 hover:bg-blue-600/20 text-left transition-colors text-sm">
                                    <type.icon size={16} className="text-gray-400"/>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {activeTab === 'Carregar' ? (
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-300 block">Carregar suas Roupas</label>
                        <div className="flex gap-3">
                            <UploadBox image={clothingImages[0]} onClick={() => clothingInputRef1.current?.click()} onRemove={() => removeClothingImage(0)} placeholderText="Roupa 1" />
                            <UploadBox image={clothingImages[1]} onClick={() => clothingInputRef2.current?.click()} onRemove={() => removeClothingImage(1)} placeholderText="Roupa 2" />
                        </div>
                        <input type="file" ref={clothingInputRef1} onChange={(e) => handleClothingFileChange(e, 0)} className="hidden" accept="image/*" />
                        <input type="file" ref={clothingInputRef2} onChange={(e) => handleClothingFileChange(e, 1)} className="hidden" accept="image/*" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-300 block">Escolher um Estilo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map((preset) => (
                                <div key={preset.name} onClick={() => setPrompt(preset.name)} className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${prompt === preset.name ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}>
                                    <img src={preset.imageUrl} alt={preset.name} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5">
                                        <p className="text-[10px] font-medium text-center truncate">{preset.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-300">Descrever Roupa (Opcional)</label>
                        <button onClick={() => setPrompt('')} className="text-[10px] text-blue-400 hover:underline">Limpar</button>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: vestido floral vermelho de verão, terno preto moderno..."
                        className="w-full h-20 bg-gray-700/50 p-3 rounded-lg text-sm resize-none placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none border border-transparent focus:border-blue-500/50"
                    />
                </div>
                
                {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
            </div>

            <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
                <button onClick={handleGenerate} disabled={isGenerating || !image} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isGenerating ? 'Gerando...' : <><Brush size={16} /> Gerar Visual</>}
                </button>
            </div>
        </div>
    );
};
