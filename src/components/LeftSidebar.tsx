
import React, { useState, useEffect, useRef } from 'react';
import { Accordion } from './ui/Accordion';
import { Star, X, MoveVertical } from 'lucide-react';
import { AiArtEffectsModal, aiArtEffectsData } from './AiArtEffectsModal';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

// ... resto do arquivo LeftSidebar (mantendo o conteúdo original, apenas a importação muda) ...
// Para brevidade, assumo que o restante do arquivo é idêntico ao original, apenas a importação mudou.
// Vou replicar o início para garantir a importação correta e colar o resto.

const EffectThumbnail: React.FC<{
    name: string;
    imageUrl: string;
    isSelected: boolean;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}> = ({ name, imageUrl, isSelected, onClick, onMouseEnter, onMouseLeave, isFavorite, onToggleFavorite }) => (
    <div 
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="cursor-pointer group flex flex-col items-center"
    >
        <div className={`relative aspect-square w-full rounded-md overflow-hidden ring-2 transition-all ${isSelected ? 'ring-blue-500 scale-105 ring-offset-2 ring-offset-[#2c2c2c] shadow-lg shadow-blue-500/40' : 'ring-transparent group-hover:ring-gray-600'}`}>
            <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" decoding="async" />
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
                <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
        <p className={`text-center text-[11px] mt-1.5 transition-colors ${isSelected ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>{name}</p>
    </div>
);

const filterData = {
    'Cenas': [
        { name: 'Vívido', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=150&h=150&fit=crop&q=80' },
        { name: 'Saturação', imageUrl: 'https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?w=150&h=150&fit=crop&q=80' },
        { name: 'Brilhante', imageUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=150&h=150&fit=crop&q=80' },
    ],
    // ... outros filtros ...
    'Clássico': [
        { name: 'Escuro', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=150&h=150&fit=crop&q=80' },
        { name: 'Frio', imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=150&h=150&fit=crop&q=80' },
        { name: 'Quente', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=150&h=150&fit=crop&q=80' },
    ],
    'Retrô': [
        { name: 'Anos 70', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&h=150&fit=crop&q=80' },
        { name: 'Vintage', imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=150&h=150&fit=crop&q=80' },
        { name: 'Sépia', imageUrl: 'https://images.unsplash.com/photo-1562778627-a0f1fa4033e4?w=150&h=150&fit=crop&q=80' },
    ],
    'Filme': [
        { name: 'Cinematográfico', imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=150&h=150&fit=crop&q=80' },
        { name: 'Kodachrome', imageUrl: 'https://images.unsplash.com/photo-1510522889103-0453b7453026?w=150&h=150&fit=crop&q=80' },
        { name: 'Technicolor', imageUrl: 'https://images.unsplash.com/photo-1542680453-c9a585f54399?w=150&h=150&fit=crop&q=80' },
    ],
    'Preto e Branco': [
        { name: 'Contraste Alto', imageUrl: 'https://images.unsplash.com/photo-1531826038897-542713a105b3?w=150&h=150&fit=crop&q=80' },
        { name: 'Noir', imageUrl: 'https://images.unsplash.com/photo-1508412846088-72b223403a25?w=150&h=150&fit=crop&q=80' },
        { name: 'Névoa', imageUrl: 'https://images.unsplash.com/photo-1485233157297-3c581692286c?w=150&h=150&fit=crop&q=80' },
    ],
};

const aiArtPreview = [
    { name: 'Desenho animado 3D 2', imageUrl: 'https://images.unsplash.com/photo-1635805737458-26a4501a3597?w=150&h=150&fit=crop&q=80' },
    { name: 'Esboço a Lápis', imageUrl: 'https://images.unsplash.com/photo-1596645939522-990d52b12224?w=150&h=150&fit=crop&q=80' },
    { name: 'Esboço a Tinta', imageUrl: 'https://images.unsplash.com/photo-1614759281297-6a4e695b1e54?w=150&h=150&fit=crop&q=80' },
    { name: 'Princesa de Conto de Fadas', imageUrl: 'https://storage.googleapis.com/aistudio-project-files/89c17245-0925-4632-a550-985c7d2429a3/c101e4a3-7640-41ff-801e-0a563a651fbb' },
    { name: 'Desenho de Linha 2', imageUrl: 'https://images.unsplash.com/photo-1589150307813-f54cff8c3132?w=150&h=150&fit=crop&q=80' },
    { name: 'Emoji', imageUrl: 'https://images.unsplash.com/photo-1611944212129-29959ab84893?w=150&h=150&fit=crop&q=80' },
];

const visualEffects = [
    { name: 'Silhueta', imageUrl: 'https://images.unsplash.com/photo-1484244233201-29892afe6a2c?w=150&h=150&fit=crop&q=80' },
    { name: 'Festivo', imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&h=150&fit=crop&q=80' },
    { name: 'Reflexo de Lente', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=150&fit=crop&q=80' },
    { name: 'Descolado', imageUrl: 'https://images.unsplash.com/photo-1583344469424-5040f5302f78?w=150&h=150&fit=crop&q=80' },
    { name: 'Pincel Mágico', imageUrl: 'https://images.unsplash.com/photo-1531214159280-079b95d26139?w=150&h=150&fit=crop&q=80' },
    { name: 'Respingo de Cor', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&h=150&fit=crop&q=80' },
    { name: 'Vintage FX', imageUrl: 'https://images.unsplash.com/photo-1534143046036-3a457859f71e?w=150&h=150&fit=crop&q=80' },
    { name: 'Noir FX', imageUrl: 'https://images.unsplash.com/photo-1550614000-4b9519e02a86?w=150&h=150&fit=crop&q=80' },
    { name: 'Cyberpunk', imageUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=150&h=150&fit=crop&q=80' },
    { name: 'Watercolor FX', imageUrl: 'https://images.unsplash.com/photo-1549887552-93f8efb4133f?w=150&h=150&fit=crop&q=80' },
    { name: 'Glitch', imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&h=150&fit=crop&q=80' },
    { name: 'Polaroid', imageUrl: 'https://images.unsplash.com/photo-1526250602277-c6b0622427dd?w=150&h=150&fit=crop&q=80' },
];

const cssFilterMap: { [key: string]: string } = {
    'Vívido': 'saturate(1.4) contrast(1.1)',
    'Saturação': 'saturate(2)',
    'Brilhante': 'brightness(1.2) contrast(1.1)',
    'Escuro': 'brightness(0.8) contrast(1.2)',
    'Frio': 'sepia(0.2) contrast(1.1) brightness(1.05)',
    'Quente': 'sepia(0.4) saturate(1.2)',
    'Anos 70': 'sepia(0.5) contrast(0.9) brightness(1.1)',
    'Vintage': 'sepia(0.6) brightness(0.9) contrast(1.1)',
    'Sépia': 'sepia(0.8)',
    'Cinematográfico': 'contrast(1.2) saturate(1.1)',
    'Kodachrome': 'sepia(0.3) saturate(1.5) contrast(1.1)',
    'Technicolor': 'sepia(0.1) saturate(1.8) contrast(1.2)',
    'Contraste Alto': 'contrast(1.5) grayscale(1)',
    'Noir': 'grayscale(1) contrast(1.3) brightness(0.9)',
    'Névoa': 'grayscale(1) contrast(0.9) brightness(1.1)',
    'Silhueta': 'contrast(2) brightness(0.5)',
    'Festivo': 'hue-rotate(20deg) saturate(1.5)',
    'Reflexo de Lente': 'none',
    'Descolado': 'hue-rotate(-30deg) saturate(1.3)',
    'Pincel Mágico': 'contrast(1.2) saturate(1.2)',
    'Respingo de Cor': 'saturate(1.8)',
    'Vintage FX': 'sepia(0.5) contrast(0.8) brightness(1.2)',
    'Noir FX': 'grayscale(1) contrast(1.2) brightness(0.8)',
    'Cyberpunk': 'hue-rotate(190deg) saturate(2) contrast(1.2)',
    'Watercolor FX': 'contrast(1.2) saturate(1.3) blur(0.5px)',
    'Glitch': 'contrast(1.5) saturate(2) hue-rotate(90deg)',
    'Polaroid': 'contrast(1.1) brightness(1.1) sepia(0.3)',
};

const generateFilterString = (effectName: string | null, intensityValue: number): string => {
    if (!effectName) return 'none';
    const baseFilter = cssFilterMap[effectName];
    if (!baseFilter || baseFilter === 'none') return 'none';

    const intensity = intensityValue / 100;
    const filterRegex = /(\w+)\(([\d\.]+\w*)\)/g;
    
    return baseFilter.replace(filterRegex, (match, funcName, value) => {
        const numericValue = parseFloat(value);
        const unit = value.replace(String(numericValue), '');
        let defaultValue = 1;
        if (['sepia', 'grayscale', 'hue-rotate', 'invert', 'opacity', 'blur'].includes(funcName)) {
            defaultValue = 0;
        }
        const newValue = defaultValue + (numericValue - defaultValue) * intensity;
        return `${funcName}(${newValue.toFixed(2)}${unit})`;
    });
};

interface AppliedEffect {
  id: number;
  name: string;
  intensity: number;
}

interface CustomPreset {
    name: string;
    layers: Omit<AppliedEffect, 'id'>[];
}

interface EffectsPanelProps {
    image: string | null;
    setImage: (image: string | null) => void;
    setTempFilter: (filter: string | null) => void;
    setAppliedCssFilter: (filter: string | null) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ image, setImage, setTempFilter, setAppliedCssFilter }) => {
    const [activeTab, setActiveTab] = useState('Filtros');
    const [effectLayers, setEffectLayers] = useState<AppliedEffect[]>([]);
    const [selectedAiEffect, setSelectedAiEffect] = useState<{ name: string; imageUrl: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [favorites, setFavorites] = useState<string[]>(['Emoji']);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
    const [draggedLayerId, setDraggedLayerId] = useState<number | null>(null);
    const nextId = useRef(0);

    const allEffectsRaw = [
        ...aiArtPreview,
        ...Object.values(filterData).flat(),
        ...visualEffects,
        ...Object.values(aiArtEffectsData).flat()
    ];

    const allEffects = Array.from(new Map(allEffectsRaw.map(item => [item.name, item])).values());
    const aiEffectNames = new Set([
        ...aiArtPreview.map(e => e.name),
        ...Object.values(aiArtEffectsData).flat().map(e => e.name)
    ]);

    const favoriteEffects = allEffects.filter(effect => favorites.includes(effect.name));

    useEffect(() => {
        const combinedFilter = effectLayers
            .map(layer => generateFilterString(layer.name, layer.intensity))
            .join(' ');
        setAppliedCssFilter(combinedFilter || null);
    }, [effectLayers, setAppliedCssFilter]);

    useEffect(() => {
        setEffectLayers([]);
        setSelectedAiEffect(null);
        setAppliedCssFilter(null);
    }, [image, setAppliedCssFilter]);

    const handleToggleFavorite = (effectName: string) => {
        setFavorites(prev => 
            prev.includes(effectName) 
                ? prev.filter(name => name !== effectName) 
                : [...prev, effectName]
        );
    };

    const handleApplyEffect = async (effectNameToApply: string) => {
        if (!image) return;
        setIsProcessing(true);
        try {
            const { base64, mimeType } = await imageUrlToBase64(image);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let prompt = '';
            switch(effectNameToApply) {
                case 'Desenho animado 3D 2':
                    prompt = `Uma foto de perfil no estilo de um personagem de desenho animado 3D. O personagem deve ter características exageradas, olhos grandes e expressivos e uma aparência geral amigável e acessível. A iluminação deve ser suave e difusa, e o fundo deve ser uma cor sólida e vibrante que complemente o personagem. A textura da pele deve ser suave e plástica, e o cabelo deve ser estilizado em mechas grossas. Mantenha as características faciais da pessoa.`;
                    break;
                case 'Esboço a Lápis':
                    prompt = "Um retrato de esboço a lápis hiper-realista, desenhado com detalhes de grafite ultrafinos e sombreamento realista. Cada textura - pele, cabelo, tecido e fundo - é renderizada em traços de lápis precisos com profundidade de luz e sombra realistas. A obra de arte parece desenhada à mão em papel de esboço marfim liso, mostrando delicadas variações de pressão e borrões suaves para realismo. Tom monocromático, iluminação de alto contraste, ilustração a lápis cinematográfica, estilo de arte premiado. Detalhe de lápis 8K, profundidade de carvão, fundo gradiente suave.";
                    break;
                case 'Esboço a Tinta':
                    prompt = `Crie uma imagem de um esboço/desenho a tinta no estilo de uma foto de um rosto idêntico à imagem de referência enviada — mantenha todas as características faciais, proporções e expressões exatamente iguais. Use tinta de cor preta com detalhes de linha intrincados e finos, desenhado sobre um fundo no estilo de página de caderno. Mostre uma mão direita segurando uma caneta e uma borracha perto do esboço, como se o artista ainda estivesse trabalhando. Inclua uma assinatura esboçada conectada por uma linha de lápis, dizendo 'por: Artista' em um estilo de escrita artística à mão. Estilo: desenho fotorrealista, textura de tinta detalhada, sombreamento suave, fibra de papel suave, resolução 8K, formato 1:1.`;
                    break;
                case 'Princesa de Conto de Fadas':
                    prompt = `Uma fotografia fantástica com uma estética de conto de fadas e mágica, capturando uma criança (uma menina) vestida de princesa.`;
                    break;
                default:
                    if (aiEffectNames.has(effectNameToApply)) {
                        prompt = `Transforme esta imagem no estilo artístico "${effectNameToApply}". Mantenha a composição original, o assunto principal e as características faciais, mas aplique o estilo visual, as texturas, as cores e a técnica artística associados a "${effectNameToApply}". O resultado deve ser uma interpretação artística de alta qualidade da imagem original neste estilo específico.`;
                    }
                    break;
            }
             if (!prompt) return;

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
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setImage(imageUrl);
                setSelectedAiEffect(null);
                imageFound = true;
                break;
              }
            }
            
            if (!imageFound) {
                const textResponse = parts.find(p => p.text)?.text;
                if (textResponse) throw new Error(`A IA não gerou a imagem. Resposta: ${textResponse}`);
                if (candidate?.finishReason) throw new Error(`Geração bloqueada. Motivo: ${candidate.finishReason}`);
                throw new Error("A IA não retornou uma imagem.");
            }
        } catch (error: any) {
            console.error("Erro ao aplicar efeito de IA:", error);
            if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED')) {
                alert("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                alert(error.message || "Falha ao aplicar efeito. Tente novamente.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelectEffect = (effect: { name: string; imageUrl: string }) => {
        const isAiEffect = aiEffectNames.has(effect.name);
        
        if (isAiEffect) {
            setSelectedAiEffect(prev => (prev?.name === effect.name ? null : effect));
        } else {
            const layerIndex = effectLayers.findIndex(layer => layer.name === effect.name);
            if (layerIndex > -1) {
                setEffectLayers(prev => prev.filter((_, index) => index !== layerIndex));
            } else {
                setEffectLayers(prev => [...prev, { id: nextId.current++, name: effect.name, intensity: 100 }]);
            }
            setSelectedAiEffect(null);
        }
    };

    const handleMouseEnter = (effectName: string) => {
        const isApplied = effectLayers.some(l => l.name === effectName);
        if (!isApplied) {
            setTempFilter(generateFilterString(effectName, 100));
        }
    };
    
    const handleIntensityChange = (id: number, newIntensity: number) => {
        setEffectLayers(prevLayers =>
            prevLayers.map((layer) => (layer.id === id ? { ...layer, intensity: newIntensity } : layer))
        );
    };

    const handleRemoveLayer = (idToRemove: number) => {
        setEffectLayers(prevLayers => prevLayers.filter(layer => layer.id !== idToRemove));
    };

    const handleSavePreset = () => {
        const name = window.prompt("Digite um nome para o seu efeito:");
        if (name && name.trim()) {
            const layersToSave = effectLayers.map(({ id, ...rest }) => rest);
            setCustomPresets(prev => [...prev, { name: name.trim(), layers: layersToSave }]);
        }
    };

    const handleApplyPreset = (preset: CustomPreset) => {
        const newLayersWithIds = preset.layers.map(layer => ({
            ...layer,
            id: nextId.current++,
        }));
        setEffectLayers(newLayersWithIds);
    };

    const handleDeletePreset = (indexToDelete: number) => {
        setCustomPresets(prev => prev.filter((_, index) => index !== indexToDelete));
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, layer: AppliedEffect) => {
        setDraggedLayerId(layer.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, overLayer: AppliedEffect) => {
        e.preventDefault();
        if (draggedLayerId === null || draggedLayerId === overLayer.id) return;
    
        const draggedIndex = effectLayers.findIndex(l => l.id === draggedLayerId);
        const overIndex = effectLayers.findIndex(l => l.id === overLayer.id);
    
        if (draggedIndex === -1 || overIndex === -1 || draggedIndex === overIndex) return;
    
        const newLayers = [...effectLayers];
        const [removed] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(overIndex, 0, removed);
        
        setEffectLayers(newLayers);
    };

    const handleDragEnd = () => {
        setDraggedLayerId(null);
    };

    return (
        <div className="w-[calc(100vw-5rem)] sm:w-80 bg-[#2c2c2c]/90 backdrop-blur-lg shadow-2xl flex flex-col h-full flex-shrink-0 relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
                <h3 className="text-white font-semibold text-lg">Fazendo mágica com IA...</h3>
                <p className="text-gray-300 text-sm mt-1">Aguarde, estamos criando sua arte.</p>
            </div>
          )}
          <div className="flex-shrink-0 px-2 pt-2">
            <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
              <button onClick={() => setActiveTab('Filtros')} className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${activeTab === 'Filtros' ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Filtros</button>
              <button onClick={() => setActiveTab('Efeitos Visuais')} className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${activeTab === 'Efeitos Visuais' ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Efeitos Visuais</button>
            </div>
          </div>
    
          <div className="flex-1 overflow-y-auto px-2 pb-4">
             <Accordion title="Favoritos">
                {favoriteEffects.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 px-2 py-2">
                        {favoriteEffects.map((effect) => (
                            <EffectThumbnail
                                key={`fav-${effect.name}`}
                                {...effect}
                                isSelected={effectLayers.some(l => l.name === effect.name) || selectedAiEffect?.name === effect.name}
                                isFavorite={true}
                                onToggleFavorite={() => handleToggleFavorite(effect.name)}
                                onClick={() => handleSelectEffect(effect)}
                                onMouseEnter={() => handleMouseEnter(effect.name)}
                                onMouseLeave={() => setTempFilter(null)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="px-4 py-2 text-xs text-gray-500">Clique na estrela para favoritar um efeito.</p>
                )}
            </Accordion>
            <Accordion title="Camadas de Efeito">
                {effectLayers.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-gray-500">Nenhum efeito de filtro aplicado.</p>
                ) : (
                    <>
                        <div className="p-2 space-y-2">
                            {effectLayers.map((layer) => (
                                <div 
                                    key={layer.id}
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, layer)}
                                    onDragOver={(e) => handleDragOver(e, layer)}
                                    onDragEnd={handleDragEnd}
                                    className={`p-2 rounded-md transition-all cursor-grab active:cursor-grabbing ${draggedLayerId === layer.id ? 'opacity-50 bg-gray-600' : 'bg-gray-800/50'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                         <div className="flex items-center gap-2">
                                            <MoveVertical size={14} className="text-gray-500" />
                                            <span className="text-xs font-semibold text-white">{layer.name}</span>
                                        </div>
                                        <button onClick={() => handleRemoveLayer(layer.id)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="range" min="0" max="100" value={layer.intensity} onChange={(e) => handleIntensityChange(layer.id, Number(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                                        <span className="text-xs text-gray-300 w-8 text-right">{layer.intensity}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {effectLayers.length > 0 && (
                            <div className="p-2 border-t border-gray-700/50 mt-2">
                                <button onClick={handleSavePreset} className="w-full text-center text-sm bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors">Salvar Efeito</button>
                            </div>
                        )}
                    </>
                )}
            </Accordion>
            <Accordion title="Meus Efeitos">
                {customPresets.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-gray-500">Nenhum efeito salvo.</p>
                ) : (
                    <div className="p-2 space-y-2">
                        {customPresets.map((preset, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                                <span className="text-xs font-semibold text-white truncate pr-2">{preset.name}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => handleApplyPreset(preset)} className="text-blue-400 hover:text-blue-300 text-xs font-bold">Aplicar</button>
                                    <button onClick={() => handleDeletePreset(index)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Accordion>
            {activeTab === 'Filtros' && (
              <>
                <div className="p-2">
                    <div onClick={() => setIsModalOpen(true)} className="cursor-pointer group relative aspect-video w-full rounded-lg overflow-hidden bg-gray-800 flex flex-col items-center justify-center text-center p-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <Star className="text-yellow-400 mb-2" size={24} />
                        <h3 className="text-white font-bold text-sm z-10">Efeitos de arte de IA</h3>
                        <p className="text-gray-300 text-xs z-10">Transforme suas fotos com IA</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {aiArtPreview.map((effect) => (
                            <EffectThumbnail
                                key={effect.name}
                                {...effect}
                                isSelected={selectedAiEffect?.name === effect.name}
                                isFavorite={favorites.includes(effect.name)}
                                onToggleFavorite={() => handleToggleFavorite(effect.name)}
                                onClick={() => handleSelectEffect(effect)}
                                onMouseEnter={() => {}}
                                onMouseLeave={() => {}}
                            />
                        ))}
                    </div>
                </div>
                {Object.entries(filterData).map(([category, effects]) => (
                    <Accordion title={category} key={category}>
                        <div className="grid grid-cols-3 gap-2 px-2">
                            {effects.map((effect) => (
                                <EffectThumbnail
                                    key={effect.name}
                                    {...effect}
                                    isSelected={effectLayers.some(l => l.name === effect.name)}
                                    isFavorite={favorites.includes(effect.name)}
                                    onToggleFavorite={() => handleToggleFavorite(effect.name)}
                                    onClick={() => handleSelectEffect(effect)}
                                    onMouseEnter={() => handleMouseEnter(effect.name)}
                                    onMouseLeave={() => setTempFilter(null)}
                                />
                            ))}
                        </div>
                    </Accordion>
                ))}
              </>
            )}
            {activeTab === 'Efeitos Visuais' && (
                 <Accordion title="Efeitos Visuais" >
                    <div className="grid grid-cols-3 gap-2 px-2">
                        {visualEffects.map((effect) => (
                            <EffectThumbnail
                                key={effect.name}
                                {...effect}
                                isSelected={effectLayers.some(l => l.name === effect.name)}
                                isFavorite={favorites.includes(effect.name)}
                                onToggleFavorite={() => handleToggleFavorite(effect.name)}
                                onClick={() => handleSelectEffect(effect)}
                                onMouseEnter={() => handleMouseEnter(effect.name)}
                                onMouseLeave={() => setTempFilter(null)}
                            />
                        ))}
                    </div>
                </Accordion>
            )}
          </div>
    
          {selectedAiEffect && (
            <div className="flex-shrink-0 p-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{selectedAiEffect.name}</span>
              </div>
              <button 
                onClick={() => handleApplyEffect(selectedAiEffect.name)}
                disabled={isProcessing}
                className="mt-2 w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Aplicar Efeito de IA
              </button>
            </div>
          )}
    
           <AiArtEffectsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
            />
        </div>
      );
    };
