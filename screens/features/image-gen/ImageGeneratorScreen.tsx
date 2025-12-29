import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Sparkles, Wand2, Edit, Settings2, ChevronDown, ChevronUp, Lightbulb, Info, AlertCircle, CheckCircle2, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AI_IMAGE_MODEL, AI_TEXT_MODEL } from '../../../config/constants.ts';

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
    ]
};

export const ImageGeneratorScreen: React.FC<{ 
    onBack: () => void; 
    onImageGenerated: (imageUrl: string) => void;
    initialPrompt?: string;
    initialImage?: string;
}> = ({ onBack, onImageGenerated, initialPrompt, initialImage }) => {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: AI_IMAGE_MODEL,
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            const part = candidate?.content?.parts.find(p => p.inlineData);
            
            if (part?.inlineData) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setSelectedImage(imageUrl);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white">
            <header className="p-4 border-b border-gray-800">
                <button onClick={onBack} className="p-2 bg-gray-800 rounded-full"><ArrowLeft size={20}/></button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                {isLoading ? (
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                ) : selectedImage ? (
                    <img src={selectedImage} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" />
                ) : (
                    <div className="w-full max-w-xl space-y-6">
                        <textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full h-32 bg-gray-800 p-4 rounded-xl border border-gray-700 outline-none focus:border-blue-500"
                            placeholder="Descreva a imagem que deseja criar..."
                        />
                        <button 
                            onClick={handleGenerate}
                            className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            Gerar Imagem
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};