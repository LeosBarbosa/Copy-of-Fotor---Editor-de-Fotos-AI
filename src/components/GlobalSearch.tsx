
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import { TOOLS } from '../data/tools';

interface GlobalSearchProps {
    onToolSelect: (toolId: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onToolSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<typeof TOOLS>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim() === '') {
            setSuggestions([]);
            return;
        }
        const filtered = TOOLS.filter(tool => 
            tool.title.toLowerCase().includes(query.toLowerCase()) || 
            tool.category.toLowerCase().includes(query.toLowerCase()) ||
            (tool as any).keywords?.some((k: string) => k.toLowerCase().includes(query.toLowerCase()))
        );
        setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    }, [query]);

    const handleSelect = (toolId: string) => {
        onToolSelect(toolId);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md group">
            <div className={`relative flex items-center bg-[#1f1f1f] rounded-md border transition-all overflow-hidden ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-transparent hover:border-gray-600'}`}>
                <div className="pl-3 text-gray-400">
                    <Search size={16} />
                </div>
                <input
                    type="text"
                    className="w-full bg-transparent border-none text-white text-sm px-3 py-2 focus:ring-0 outline-none placeholder-gray-500"
                    placeholder="Pesquisar ferramentas (ex: Retrato, Borracha...)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && query.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2c2c2c] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.length > 0 ? (
                        <>
                            <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700/50">
                                Sugestões
                            </div>
                            {suggestions.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleSelect(tool.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700/50 transition-colors text-left group"
                                >
                                    <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
                                        <img src={tool.imageUrl} alt={tool.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white font-medium truncate group-hover:text-blue-400 transition-colors">{tool.title}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{tool.category}</div>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                            <Sparkles size={20} className="text-gray-600" />
                            <span>Nenhuma ferramenta encontrada.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
