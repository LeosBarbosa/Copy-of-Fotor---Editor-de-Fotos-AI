
import React from 'react';

interface ToolCardProps {
    title: string;
    imageUrl: string;
    onClick?: () => void;
    isNew?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, imageUrl, onClick, isNew }) => (
    <button onClick={onClick} className="flex flex-col text-center cursor-pointer group disabled:cursor-not-allowed relative" disabled={!onClick}>
        <div className={`aspect-square w-full bg-gray-500 rounded-lg overflow-hidden transition-all duration-300 ${isNew ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#2c2c2c]' : 'group-hover:scale-105'}`}>
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            {isNew && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                    NOVO
                </div>
            )}
        </div>
        <span className={`text-xs mt-2 transition-colors ${isNew ? 'text-green-400 font-bold' : 'text-gray-300'}`}>{title}</span>
    </button>
);
