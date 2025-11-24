
import React from 'react';
import { Plus, ChevronDown, Cloud, Search, Download, CircleUserRound, Menu, LayoutPanelLeft, Layers } from 'lucide-react';
import { GlobalSearch } from '../../features/global-search/GlobalSearch';

export const Header: React.FC<{
  onMenuToggle?: () => void;
  onUploadClick?: () => void;
  onDownloadClick?: () => void;
  layoutMode?: string;
  onLayoutToggle?: () => void;
  onToolSelect?: (toolId: string) => void;
}> = ({ onMenuToggle, onUploadClick, onDownloadClick, layoutMode, onLayoutToggle, onToolSelect }) => {
  return (
    <header className="bg-[#2c2c2c] text-white flex items-center justify-between px-2 sm:px-4 h-16 flex-shrink-0 border-b border-gray-700/50 z-20 relative">
      <div className="flex items-center gap-2 sm:gap-6">
        {onMenuToggle && (
            <button onClick={onMenuToggle} className="p-2 rounded-full md:hidden hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors">
                <Menu size={24} />
            </button>
        )}
        <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <circle cx="50" cy="50" r="48" fill="#FFF"/>
                <path d="50,2 A48,48 0 0,1 98,50 L50,50 Z" fill="#FF5733"/>
                <path d="98,50 A48,48 0 0,1 50,98 L50,50 Z" fill="#C70039"/>
                <path d="50,98 A48,48 0 0,1 2,50 L50,50 Z" fill="#900C3F"/>
                <path d="2,50 A48,48 0 0,1 50,2 L50,50 Z" fill="#581845"/>
                <circle cx="50" cy="50" r="20" fill="#2C2C2C"/>
            </svg>
            <span className="text-xl font-bold hidden md:block tracking-tight">Fotor</span>
        </div>
        <div className="relative hidden lg:block">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#3a3a3a] rounded-md hover:bg-gray-600/50 transition-colors border border-transparent hover:border-gray-600">
            <span className="font-semibold text-sm">Editor de fotos AI</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-start ml-2 sm:ml-8 gap-2 sm:gap-4 max-w-xl">
        {onToolSelect ? (
            <GlobalSearch onToolSelect={onToolSelect} />
        ) : (
             <div className="relative w-full max-w-md hidden sm:flex items-center bg-[#1f1f1f] rounded-md border border-transparent">
                <div className="pl-3 text-gray-400">
                    <Search size={16} />
                </div>
                <input 
                    type="text" 
                    className="w-full bg-transparent border-none text-white text-sm px-3 py-2 focus:ring-0 outline-none placeholder-gray-500" 
                    placeholder="Pesquisar..." 
                    disabled 
                />
            </div>
        )}
        
        <div className="hidden sm:flex items-center gap-2 p-1 bg-[#1f1f1f] rounded-md flex-shrink-0 border border-gray-800">
            <button className="p-1.5 rounded-md text-gray-400 hover:text-white transition-colors hover:bg-gray-700/50" title="Salvar na nuvem"><Cloud size={20} /></button>
             {onLayoutToggle && (
              <>
                <div className="w-px h-5 bg-gray-700"></div>
                <button
                    onClick={onLayoutToggle}
                    title={layoutMode === 'split' ? "Alternar para Sobreposição" : "Alternar para Dividido"}
                    className={`p-1.5 rounded-md transition-colors ${layoutMode === 'split' ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                >
                    {layoutMode === 'split' ? <LayoutPanelLeft size={20} /> : <Layers size={20} />}
                </button>
              </>
            )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
        <button onClick={onUploadClick} className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#3a3a3a] hover:bg-gray-600/50 rounded-md transition-all border border-transparent hover:border-gray-500 group">
          <Plus size={16} className="text-gray-400 group-hover:text-white transition-colors" />
          <span className="font-semibold text-sm">Carregar</span>
        </button>
        <button onClick={onDownloadClick} className="px-3 sm:px-4 py-2 font-bold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-900/20">
            <Download size={16} />
            <span className="hidden sm:inline">Baixar</span>
        </button>
        <div className="flex items-center gap-2 text-gray-400 pl-2 border-l border-gray-700/50">
            <button className="p-1 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors"><CircleUserRound size={24} /></button>
        </div>
      </div>
    </header>
  );
};
