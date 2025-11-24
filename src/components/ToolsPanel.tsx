
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Accordion } from './ui/Accordion';
import { ToolCard } from './ui/ToolCard';
import { TOOLS } from '../data/tools';

interface ToolsPanelProps {
    onToolSelect: (toolId: string) => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ onToolSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [toolsList, setToolsList] = useState(TOOLS);
    const [lastUsedToolId, setLastUsedToolId] = useState<string | null>(null);

    const filteredTools = toolsList.filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedTools = filteredTools.reduce((acc, tool) => {
        (acc[tool.category] = acc[tool.category] || []).push(tool);
        return acc;
    }, {} as Record<string, typeof TOOLS>);

    const categoryOrder = ['Edição com IA', 'Criar com IA', 'Restauração e Aprimoramento IA'];

    const handleToolClick = (toolId: string) => {
        setLastUsedToolId(toolId);
        setToolsList(prevTools => {
            const toolIndex = prevTools.findIndex(t => t.id === toolId);
            if (toolIndex < 0) return prevTools;
            const tool = prevTools[toolIndex];
            const newTools = [...prevTools];
            newTools.splice(toolIndex, 1);
            newTools.unshift(tool);
            return newTools;
        });
        onToolSelect(toolId);
    };

    return (
        <div className="w-[calc(100vw-5rem)] sm:w-96 bg-[#2c2c2c]/90 backdrop-blur-lg shadow-2xl flex flex-col h-full flex-shrink-0">
            <div className="p-4 flex-shrink-0 border-b border-gray-700/50">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar ferramentas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border-none rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
                {Object.keys(groupedTools).length > 0 ? (
                    categoryOrder.map(category => {
                        if (groupedTools[category]) {
                            return (
                                <Accordion title={category} key={category}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2 py-2">
                                        {groupedTools[category].map(tool => (
                                            <ToolCard 
                                                key={tool.id} 
                                                {...tool} 
                                                onClick={() => handleToolClick(tool.id)} 
                                                isNew={lastUsedToolId === tool.id || tool.isNew}
                                            />
                                        ))}
                                    </div>
                                </Accordion>
                            )
                        }
                        return null;
                    })
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400">Nenhuma ferramenta encontrada para "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};
