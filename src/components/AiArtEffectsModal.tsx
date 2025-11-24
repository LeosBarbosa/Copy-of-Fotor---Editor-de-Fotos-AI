
import React, { useState } from 'react';
import { X, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Data for the modal
export const aiArtEffectsData = {
    Populares: [
        { name: 'Desenho animado 3D 2', imageUrl: 'https://images.unsplash.com/photo-1635805737458-26a4501a3597?w=150&h=150&fit=crop' },
        { name: 'Desenho de Linha 3', imageUrl: 'https://images.unsplash.com/photo-1589150307813-f54cff8c3132?w=150&h=150&fit=crop' },
        { name: 'Emoji', imageUrl: 'https://images.unsplash.com/photo-1611944212129-29959ab84893?w=150&h=150&fit=crop' },
        { name: 'Retrato Moderno', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop' },
        { name: 'Estilo Ghibli 2', imageUrl: 'https://images.unsplash.com/photo-1607328823093-a98211a7c38c?w=150&h=150&fit=crop' },
        { name: 'Aquarela X', imageUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=150&h=150&fit=crop' },
    ],
    'Desenho animado': [
        { name: 'Animes Kawaii', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&h=150&fit=crop' },
        { name: 'Desenho de sobrancelha', imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=150&h=150&fit=crop' },
        { name: 'Anime', imageUrl: 'https://images.unsplash.com/photo-1569701813229-33284b643683?w=150&h=150&fit=crop' },
    ],
    Esboço: [
        { name: 'Esboço 3', imageUrl: 'https://images.unsplash.com/photo-1596645939522-990d52b12224?w=150&h=150&fit=crop' },
        { name: 'Desenho de Linha 2', imageUrl: 'https://images.unsplash.com/photo-1614759281297-6a4e695b1e54?w=150&h=150&fit=crop' },
        { name: 'Esboço Retrô', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&h=150&fit=crop' },
    ],
    Aquarela: [
         { name: 'Hora Dourada', imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h=150&fit=crop' },
         { name: 'Aquarela 3', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&h=150&fit=crop' },
         { name: 'Aquarela', imageUrl: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=150&h=150&fit=crop' },
    ],
    Universal: [
        { name: 'Quadrinhos Americanos', imageUrl: 'https://images.unsplash.com/photo-1598255531580-1a7cac1c7619?w=150&h=150&fit=crop' },
        { name: 'Selo de viagem plano', imageUrl: 'https://images.unsplash.com/photo-1527633245-88898b670661?w=150&h=150&fit=crop' },
        { name: 'Pin-up', imageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop' },
    ],
    Artista: [
        { name: 'Van Gogh', imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=150&h=150&fit=crop' },
        { name: 'Caravaggio', imageUrl: 'https://images.unsplash.com/photo-1578320339820-2361697725a0?w=150&h=150&fit=crop' },
        { name: 'Monet', imageUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=150&h=150&fit=crop' },
    ]
};

const categories = ['Favorito', 'Todos', 'Populares', 'Desenho animado', 'Esboço', 'Aquarela', 'Universal', 'Artista', 'Pixel', 'Figura de ação'];

interface AiArtEffectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    favorites: string[];
    onToggleFavorite: (effectName: string) => void;
}

const AiArtThumbnail: React.FC<{
    name: string;
    imageUrl: string;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}> = ({ name, imageUrl, isFavorite, onToggleFavorite }) => (
    <div className="cursor-pointer group flex flex-col items-center">
        <div className="relative aspect-square w-full rounded-md overflow-hidden bg-gray-700">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" decoding="async" />
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
        <p className="text-center text-[11px] mt-1.5 text-gray-300 group-hover:text-white">{name}</p>
    </div>
);


export const AiArtEffectsModal: React.FC<AiArtEffectsModalProps> = ({ isOpen, onClose, favorites, onToggleFavorite }) => {
    const [activeCategory, setActiveCategory] = useState('Todos');

    if (!isOpen) return null;
    
    const allEffects = Object.values(aiArtEffectsData).flat();
    const favoriteEffects = allEffects.filter(effect => favorites.includes(effect.name));

    const renderContent = () => {
        // Handle Favorite category
        if (activeCategory === 'Favorito') {
            return (
                <div className="grid grid-cols-3 gap-4">
                    {favoriteEffects.length > 0 ? favoriteEffects.map(effect => (
                        <AiArtThumbnail 
                            key={effect.name} {...effect} 
                            isFavorite={favorites.includes(effect.name)}
                            onToggleFavorite={() => onToggleFavorite(effect.name)}
                        />
                    )) : <p className="text-gray-400 col-span-3 text-center text-sm">Você ainda não salvou nenhum efeito.</p>}
                </div>
            );
        }

        // Handle 'Todos' category
        if (activeCategory === 'Todos') {
             return Object.entries(aiArtEffectsData).map(([category, effects]) => (
                 <section key={category} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-semibold text-sm">{category}</h3>
                        <button onClick={() => setActiveCategory(category)} className="text-blue-400 hover:underline text-xs">Mais &gt;</button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {effects.slice(0, 6).map(effect => (
                            <AiArtThumbnail 
                                key={effect.name} {...effect} 
                                isFavorite={favorites.includes(effect.name)}
                                onToggleFavorite={() => onToggleFavorite(effect.name)}
                            />
                        ))}
                    </div>
                </section>
            ));
        }

        // Handle specific categories
        const categoryEffects = aiArtEffectsData[activeCategory as keyof typeof aiArtEffectsData];
        if (categoryEffects) {
             return (
                <div className="grid grid-cols-3 gap-4">
                    {categoryEffects.map(effect => (
                        <AiArtThumbnail 
                            key={effect.name} {...effect} 
                            isFavorite={favorites.includes(effect.name)}
                            onToggleFavorite={() => onToggleFavorite(effect.name)}
                        />
                    ))}
                </div>
            );
        }

        return <p className="text-gray-400 col-span-3 text-center text-sm">Efeitos para esta categoria estarão disponíveis em breve.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={onClose}>
            <div className="bg-[#2c2c2c] w-[500px] h-[90vh] rounded-lg flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <h2 className="font-bold text-white text-base">Efeitos de arte de IA</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </header>
                
                <div className="flex items-center gap-2 p-2 border-b border-gray-700/50 overflow-x-auto flex-shrink-0">
                    <button className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-full"><ChevronLeft size={16}/></button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                activeCategory === cat ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-700/50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button className="p-2 text-gray-400 hover:bg-gray-700/50 rounded-full"><ChevronRight size={16}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                   {renderContent()}
                </div>

            </div>
        </div>
    );
};
