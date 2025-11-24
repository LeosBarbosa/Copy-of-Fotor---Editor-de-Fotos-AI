
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Sparkles, Wand2, Edit, Settings2, ChevronDown, ChevronUp, Lightbulb, Info, AlertCircle, CheckCircle2, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AI_IMAGE_MODEL, AI_TEXT_MODEL } from '../../config/constants';

const AspectRatioButton: React.FC<{ label: string; value: string; icon: React.ElementType; active: boolean; onClick: (value: string) => void }> = ({ label, value, icon: Icon, active, onClick }) => (
    <button onClick={() => onClick(value)} className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg border transition-all ${active ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-[#2a2d33] text-gray-400 border-gray-600 hover:bg-[#3a3d43] hover:text-gray-200'}`}>
        <Icon size={18} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

const StyleSuggestion: React.FC<{ name: string; imageUrl: string; onClick: () => void }> = ({ name, imageUrl, onClick }) => (
    <div className="text-center cursor-pointer group" onClick={onClick}>
        <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-2 bg-gray-800 border border-gray-700 group-hover:border-blue-500 transition-colors">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
        </div>
        <p className="text-xs text-gray-300 group-hover:text-white font-medium">{name}</p>
    </div>
);

const categorizedStyles = {
    'Populares': [
        { name: 'Fotorrealista', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop', prompt: 'Photorealistic masterpiece, 8k resolution, ultra-detailed, cinematic lighting, raw photo quality,' },
        { name: 'Desenho 3D', imageUrl: 'https://images.unsplash.com/photo-1635805737458-26a4501a3597?w=150&h=150&fit=crop', prompt: '3D cartoon style, Pixar render style, cute, volumetric lighting, 4k, vibrant colors, smooth textures,' },
        { name: 'Anime', imageUrl: 'https://images.unsplash.com/photo-1607328823093-a98211a7c38c?w=150&h=150&fit=crop', prompt: 'Anime style, digital art, Studio Ghibli inspired, highly detailed, vibrant, cel shaded,' },
        { name: 'Cyberpunk', imageUrl: 'https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?w=150&h=150&fit=crop', prompt: 'Cyberpunk aesthetic, neon lights, futuristic, high tech, night city, rain, reflections,' },
    ],
    'Realista': [
        { name: 'Retrato Cinematográfico', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop', prompt: 'Cinematic portrait, shot on 85mm lens, f/1.8 aperture for bokeh, dramatic Rembrandt lighting, rim light, ultra-realistic skin texture, sharp eyes, moody atmosphere, color graded,' },
        { name: 'Fotografia de Produto', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop', prompt: 'Professional product photography, studio lighting, clean infinite background, 8k, sharp focus, commercial quality,' },
        { name: 'Paisagem Épica', imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h=150&fit=crop', prompt: 'Epic landscape, wide angle lens, golden hour lighting, intricate details, National Geographic style, hyperrealistic,' },
    ],
    'Artístico': [
        { name: 'Arte Conceitual', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&h=150&fit=crop', prompt: 'Concept art, digital painting, matte painting, dramatic composition, ArtStation trending, highly detailed,' },
        { name: 'Aquarela', imageUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=150&h=150&fit=crop', prompt: 'Soft watercolor painting, pastel colors, textured paper, artistic, ethereal, dreamy, wet-on-wet technique,' },
        { name: 'Pintura a Óleo', imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=150&h=150&fit=crop', prompt: 'Classic oil painting, rich textures, visible brushstrokes, detailed, masterpiece, canvas texture,' },
        { name: 'Pixel Art', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&h=150&fit=crop', prompt: 'Pixel art, 16-bit, retro game sprite, vibrant, detailed, sharp edges,' },
    ],
    'Abstrato': [
        { name: 'Surrealismo', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=150&fit=crop', prompt: 'Surrealist art, dreamlike, Salvador Dali inspired, strange, impossible composition, melting shapes,' },
        { name: 'Vaporwave', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&h=150&fit=crop', prompt: 'Vaporwave aesthetic, 90s retro, purple and pink gradient, glitch art, greek statues, grid background,' },
        { name: 'Low Poly', imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=150&h=150&fit=crop', prompt: 'Low poly art, 3d render, minimalist, geometric shapes, soft lighting, isometric view,' },
    ]
};

const aspectRatios = [
    { label: '1:1', value: '1:1', icon: Square },
    { label: '16:9', value: '16:9', icon: RectangleHorizontal },
    { label: '9:16', value: '9:16', icon: RectangleVertical },
    { label: '4:3', value: '4:3', icon: RectangleHorizontal },
    { label: '3:4', value: '3:4', icon: RectangleVertical },
];

interface PromptFeedback {
    score: number;
    message: string;
    color: string;
    icon: React.ElementType;
}

export const ImageGeneratorScreen: React.FC<{ 
    onBack: () => void; 
    onImageGenerated: (imageUrl: string) => void;
    initialPrompt?: string;
    initialImage?: string;
}> = ({ onBack, onImageGenerated, initialPrompt, initialImage }) => {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImages, setGeneratedImages] = useState<string[]>(initialImage ? [initialImage] : []);
    const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [activeCategory, setActiveCategory] = useState<keyof typeof categorizedStyles>('Populares');
    const [feedback, setFeedback] = useState<PromptFeedback>({ score: 0, message: 'Comece a digitar...', color: 'text-gray-500', icon: Info });
    const [modelStyle, setModelStyle] = useState('Padrão'); // Estado para o estilo do modelo

    useEffect(() => {
        if (!prompt) {
            setFeedback({ score: 0, message: 'Digite um prompt para começar.', color: 'text-gray-500', icon: Info });
            return;
        }
        const words = prompt.trim().split(/\s+/).length;
        const hasStyle = /estilo|style|art|realist|painting|drawing|sketch|3d|anime/i.test(prompt);
        const hasLighting = /luz|light|shadow|sombra|cinematic|studio|sun|dark/i.test(prompt);
        const hasQuality = /8k|4k|hd|res|detailed|quality/i.test(prompt);
        
        let score = 0;
        if (words > 2) score += 10;
        if (words > 5) score += 15;
        if (words > 10) score += 15;
        if (hasStyle) score += 20;
        if (hasLighting) score += 20;
        if (hasQuality) score += 20;

        let message = '';
        let color = '';
        let icon = Info;

        if (score < 30) {
            message = 'Muito curto. Tente adicionar um estilo ou descrever o cenário.';
            color = 'text-red-400';
            icon = AlertCircle;
        } else if (score < 70) {
            message = 'Bom começo! Adicione detalhes de iluminação ou qualidade para melhorar.';
            color = 'text-yellow-400';
            icon = Lightbulb;
        } else {
            message = 'Excelente prompt! Rico em detalhes e estilo.';
            color = 'text-green-400';
            icon = CheckCircle2;
        }
        setFeedback({ score, message, color, icon });
    }, [prompt]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, insira um prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let finalPrompt = prompt.trim();
            
            // Auto-inject high quality keywords if lacking
            const lowQualityInput = !/8k|detailed|realistic|cinematic|studio/i.test(finalPrompt);
            const isPhotoStyle = !/cartoon|anime|pixel|drawing|painting/i.test(finalPrompt);

            if (lowQualityInput && isPhotoStyle) {
                finalPrompt += ", photorealistic, shot on 35mm lens, cinematic lighting, sharp focus, high resolution, 8k, ultra-detailed";
            } else if (lowQualityInput) {
                finalPrompt += ", high quality, detailed, masterpiece, 4k";
            }

            if (negativePrompt.trim()) {
                finalPrompt += `. \nNegative prompt (exclude): ${negativePrompt.trim()}.`;
            }
            
            finalPrompt += `. \nTechnical Specs: Aspect Ratio ${aspectRatio}.`;
            finalPrompt += `. \nModel Style: ${modelStyle}.`; // Inclui o estilo do modelo

            const response = await ai.models.generateContent({
                model: AI_IMAGE_MODEL,
                contents: { parts: [{ text: finalPrompt }] },
                config: { 
                    responseModalities: [Modality.IMAGE],
                },
            });

            const candidate = response.candidates?.[0];
            
            if (!candidate) {
                throw new Error("A IA não retornou candidatos. O servidor pode estar sobrecarregado.");
            }

            const parts = candidate?.content?.parts || [];
            let imageFound = false;
            
            for (const part of parts) {
              if (part.inlineData) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setGeneratedImages([imageUrl]);
                setSelectedImage(imageUrl);
                imageFound = true;
                break;
              }
            }

            if (!imageFound) {
                const textResponse = candidate?.content?.parts?.[0]?.text;
                if (textResponse) {
                    throw new Error(`A IA respondeu apenas com texto: "${textResponse.substring(0, 150)}..."`);
                }
                if (candidate?.finishReason) {
                    throw new Error(`A geração foi bloqueada. Motivo: ${candidate.finishReason}`);
                }
                throw new Error("A IA não retornou nenhuma imagem.");
            }

        } catch (err: any) {
            console.error("Erro na geração de IA:", err);
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
                setError("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                setError(err.message || 'Ocorreu um erro ao gerar a imagem. Por favor, tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) return;
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: AI_TEXT_MODEL,
                contents: { parts: [{ text: `Rewrite the following user prompt to be highly detailed, artistic, and descriptive for an AI image generator. Keep it under 100 words. Include details about lighting, camera angles, texture, and atmosphere. User prompt: "${prompt}". Output ONLY the enhanced prompt text.` }] },
            });
            setPrompt(response.text?.trim() || prompt);
        } catch (err) {
            console.error("Error enhancing prompt:", err);
        } finally {
            setIsEnhancingPrompt(false);
        }
    };

    const handleSurpriseMe = async () => {
        setIsEnhancingPrompt(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: AI_TEXT_MODEL,
                contents: { parts: [{ text: "Generate a creative, detailed, and random prompt for an AI image generator. It should describe a unique scene with specific artistic style and lighting. Output ONLY the prompt text." }] },
            });
            setPrompt(response.text?.trim() || '');
        } catch (err) {
            console.error("Error generating random prompt:", err);
        } finally {
            setIsEnhancingPrompt(false);
        }
    };

    const handleDownload = () => {
        if (!selectedImage) return;
        fetch(selectedImage)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `gerado-ia-${Date.now()}.jpeg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(err => console.error("Download failed", err));
    };

    const handleEdit = () => {
        if (selectedImage) {
            onImageGenerated(selectedImage);
        }
    };
    
    const handleSuggestionClick = (suggestionPrompt: string) => {
        if (!prompt.trim()) {
            setPrompt(suggestionPrompt);
        } else {
            setPrompt(prev => `${prev}, ${suggestionPrompt}`);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <header className="flex-shrink-0 z-10 p-4">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg drop-shadow-md">Gerador de Imagens IA</h1>
                </div>
            </header>
            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-white font-semibold text-lg">Gerando sua obra-prima...</h3>
                        <p className="text-gray-300 text-sm mt-1">A IA está criando uma imagem em 4K.</p>
                    </div>
                ) : generatedImages.length > 0 ? (
                    <div className="flex flex-col items-center gap-4 text-center w-full h-full justify-center">
                        <div className="max-w-2xl w-full aspect-square">
                            <img 
                                src={selectedImage || generatedImages[0]} 
                                alt="Imagem gerada" 
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center w-full max-w-4xl">
                        <div className="flex justify-center items-center">
                            <div className="w-20 h-20 bg-zinc-700 text-blue-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-800">
                                <Wand2 size={40} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Gerador de Imagens IA</h2>
                        <p className="text-gray-400 mb-8">Transforme suas palavras em arte única.</p>
                        
                        <div className="bg-[#2c2c2c] p-6 rounded-xl border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-300">Inspire-se com estilos</span>
                            </div>
                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                                {Object.keys(categorizedStyles).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category as keyof typeof categorizedStyles)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                            activeCategory === category ? 'bg-blue-600 text-white' : 'bg-[#3a3d43] text-gray-400 hover:bg-[#4a4d53]'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {categorizedStyles[activeCategory].map((style) => (
                                    <StyleSuggestion 
                                        key={style.name} 
                                        name={style.name} 
                                        imageUrl={style.imageUrl} 
                                        onClick={() => handleSuggestionClick(style.prompt)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="flex-shrink-0 z-10 p-4 bg-[#1F1F1F]">
                {error && <div className="max-w-xl mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                <div className="max-w-xl mx-auto flex flex-col gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
                   <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                             <label className="text-xs text-gray-400">Prompt</label>
                             <div className="flex gap-2">
                                 <button onClick={handleSurpriseMe} disabled={isEnhancingPrompt || isLoading} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"><Lightbulb size={12} /> Surpreenda-me</button>
                                 <button onClick={handleEnhancePrompt} disabled={isEnhancingPrompt || isLoading || !prompt.trim()} className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"><Sparkles size={12} /> Aprimorar Prompt</button>
                             </div>
                        </div>
                        <div className="relative">
                             <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={isEnhancingPrompt ? "Aprimorando seu prompt..." : "Descreva o que você quer criar..."} className="w-full h-24 bg-gray-700/50 p-2 rounded-md text-sm resize-none placeholder-gray-400 focus:ring-1 focus:ring-blue-500 transition-all outline-none pr-8" disabled={isEnhancingPrompt} />
                            {isEnhancingPrompt && <div className="absolute bottom-2 right-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div></div>}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${feedback.score < 30 ? 'bg-red-500' : feedback.score < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${feedback.score}%` }}></div>
                            </div>
                            <div className={`flex items-center gap-1 ${feedback.color} whitespace-nowrap transition-colors`}><feedback.icon size={12} /><span className="text-[10px]">{feedback.message}</span></div>
                        </div>
                    </div>
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-blue-400 transition-colors w-max"><Settings2 size={14} /> Configurações Avançadas {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                    {showAdvanced && (
                        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Estilo do Modelo</label>
                                <select value={modelStyle} onChange={(e) => setModelStyle(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded-md text-sm border border-gray-600">
                                    <option value="Padrão">Padrão</option>
                                    <option value="Fotografia">Fotografia</option>
                                    <option value="Arte">Arte</option>
                                    <option value="Anime">Anime</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Prompt Negativo</label>
                                <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="Ex: texto, pessoas, baixa qualidade..." className="w-full h-16 bg-gray-700/50 p-2 rounded-md text-sm resize-none placeholder-gray-400 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Proporção da Imagem</label>
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {aspectRatios.map(ar => (<AspectRatioButton key={ar.value} label={ar.label} value={ar.value} icon={ar.icon} active={aspectRatio === ar.value} onClick={setAspectRatio} />))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-4 pt-2">
                         {generatedImages.length > 0 ? (
                            <>
                                <button onClick={handleEdit} disabled={!selectedImage} className="flex-1 bg-gray-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors disabled:opacity-50"> <Edit size={18} /> Editar</button>
                                <button onClick={handleDownload} disabled={!selectedImage} className="flex-1 bg-blue-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"> <Download size={18} /> Baixar</button>
                            </>
                        ) : (
                            <button onClick={handleGenerate} disabled={isLoading || isEnhancingPrompt} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"><Wand2 size={18} />{isLoading ? 'Gerando...' : 'Gerar Imagens'}</button>
                        )}
                    </div>
                    {generatedImages.length > 0 && <button onClick={handleGenerate} disabled={isLoading || isEnhancingPrompt} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform mt-2"><Wand2 size={18} />{isLoading ? 'Gerando...' : 'Gerar Novamente'}</button>}
                </div>
            </footer>
        </div>
    );
};
