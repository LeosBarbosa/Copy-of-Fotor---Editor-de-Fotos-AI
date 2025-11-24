
import React from 'react';
import { Heading1, Heading2, Baseline, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Layers, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import { Accordion } from './ui/Accordion';
import type { CanvasElementData } from '../types';

const ControlRow: React.FC<{ children: React.ReactNode; label: string }> = ({ label, children }) => (
    <div className="flex items-center justify-between px-4 py-2 gap-4">
        <label className="text-sm text-gray-300 whitespace-nowrap shrink-0">{label}</label>
        <div className="min-w-0 flex-1 flex justify-end">{children}</div>
    </div>
);

interface TextPanelProps {
    onAddText: (style: Partial<CanvasElementData>) => void;
    selectedElement: CanvasElementData | null;
    onUpdateElement: (id: number, updates: Partial<CanvasElementData>) => void;
    onReorder: (id: number, direction: 'front' | 'back' | 'forward' | 'backward') => void;
}

export const TextPanel: React.FC<TextPanelProps> = ({ onAddText, selectedElement, onUpdateElement, onReorder }) => {
    const isTextSelected = selectedElement?.type === 'text';

    const handleUpdate = (updates: Partial<CanvasElementData>) => {
        if (isTextSelected && selectedElement) {
            onUpdateElement(selectedElement.id, updates);
        }
    };
    
    const fontStyles = ['Impact', 'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Roboto', 'Lato', 'Montserrat'];

    return (
        <div className="w-[calc(100vw-5rem)] sm:w-80 bg-[#2c2c2c]/90 backdrop-blur-lg shadow-2xl flex flex-col h-full flex-shrink-0 text-white">
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                
                <Accordion title="Adicionar Texto">
                    <div className="grid grid-cols-3 gap-2 px-2 py-2">
                        <button onClick={() => onAddText({ content: 'Título', fontSize: 72, fontWeight: 'bold' })} className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md hover:bg-gray-600/50">
                            <Heading1 size={20} />
                            <span className="text-xs mt-1">Título</span>
                        </button>
                        <button onClick={() => onAddText({ content: 'Subtítulo', fontSize: 48 })} className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md hover:bg-gray-600/50">
                            <Heading2 size={20} />
                            <span className="text-xs mt-1">Subtítulo</span>
                        </button>
                        <button onClick={() => onAddText({ content: 'Adicione um pouco de texto', fontSize: 24, fontWeight: 'normal' })} className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md hover:bg-gray-600/50">
                            <Baseline size={20} />
                            <span className="text-xs mt-1">Corpo</span>
                        </button>
                    </div>
                </Accordion>

                <Accordion title="Opções de Texto">
                    <div className={`py-1 transition-opacity ${isTextSelected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <ControlRow label="Fonte">
                            <select value={selectedElement?.fontFamily || 'Arial'} onChange={e => handleUpdate({ fontFamily: e.target.value })} className="bg-gray-700 text-white text-xs rounded-md p-2 max-w-32 border-none outline-none cursor-pointer">
                                {fontStyles.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
                            </select>
                        </ControlRow>
                        
                        <ControlRow label="Tamanho">
                             <input type="number" value={selectedElement?.fontSize || 24} onChange={e => handleUpdate({ fontSize: Number(e.target.value) })} className="bg-gray-700 w-20 p-1 rounded-md text-xs"/>
                        </ControlRow>

                         <ControlRow label="Cor">
                             <input type="color" value={selectedElement?.color || '#ffffff'} onChange={e => handleUpdate({ color: e.target.value })} className="w-8 h-8 p-1 bg-gray-700 rounded-md cursor-pointer" />
                        </ControlRow>

                        <ControlRow label="Formato">
                             <div className="flex bg-gray-700 rounded-md overflow-hidden">
                                 <button onClick={() => handleUpdate({ fontWeight: selectedElement?.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-2 hover:bg-gray-600 ${selectedElement?.fontWeight === 'bold' ? 'bg-gray-600 text-blue-400' : ''}`}><Bold size={16} /></button>
                                 <button onClick={() => handleUpdate({ fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-2 hover:bg-gray-600 ${selectedElement?.fontStyle === 'italic' ? 'bg-gray-600 text-blue-400' : ''}`}><Italic size={16} /></button>
                                 <button className="p-2 hover:bg-gray-600"><Underline size={16} /></button>
                             </div>
                        </ControlRow>

                        <ControlRow label="Alinhamento">
                             <div className="flex bg-gray-700 rounded-md overflow-hidden">
                                 <button onClick={() => handleUpdate({ textAlign: 'left' })} className={`p-2 hover:bg-gray-600 ${selectedElement?.textAlign === 'left' ? 'bg-gray-600 text-blue-400' : ''}`}><AlignLeft size={16} /></button>
                                 <button onClick={() => handleUpdate({ textAlign: 'center' })} className={`p-2 hover:bg-gray-600 ${selectedElement?.textAlign === 'center' ? 'bg-gray-600 text-blue-400' : ''}`}><AlignCenter size={16} /></button>
                                 <button onClick={() => handleUpdate({ textAlign: 'right' })} className={`p-2 hover:bg-gray-600 ${selectedElement?.textAlign === 'right' ? 'bg-gray-600 text-blue-400' : ''}`}><AlignRight size={16} /></button>
                             </div>
                        </ControlRow>

                        <ControlRow label="Ordem">
                            <div className="flex items-center gap-1 bg-gray-700 rounded-md p-1">
                                <button onClick={() => selectedElement && onReorder(selectedElement.id, 'front')} title="Trazer para frente" className="p-1.5 hover:bg-gray-600 rounded text-gray-300 hover:text-white"><ChevronsUp size={16} /></button>
                                <button onClick={() => selectedElement && onReorder(selectedElement.id, 'forward')} title="Avançar" className="p-1.5 hover:bg-gray-600 rounded text-gray-300 hover:text-white"><ChevronUp size={16} /></button>
                                <button onClick={() => selectedElement && onReorder(selectedElement.id, 'backward')} title="Recuar" className="p-1.5 hover:bg-gray-600 rounded text-gray-300 hover:text-white"><ChevronDown size={16} /></button>
                                <button onClick={() => selectedElement && onReorder(selectedElement.id, 'back')} title="Enviar para trás" className="p-1.5 hover:bg-gray-600 rounded text-gray-300 hover:text-white"><ChevronsDown size={16} /></button>
                            </div>
                        </ControlRow>
                    </div>
                </Accordion>
            </div>
        </div>
    );
};
