
import React from 'react';
import { NavItem as NavItemType, NavItemId } from '../../types';
import { Sparkles, Settings, Wand, Eye, Frame, Type, Shapes, Upload, MoreHorizontal } from 'lucide-react';

const navItems: NavItemType[] = [
    { id: 'ferramentas', label: 'Ferramentas', icon: Sparkles },
    { id: 'ajustar', label: 'Ajustar', icon: Settings },
    { id: 'efeitos', label: 'Efeitos', icon: Wand },
    { id: 'beleza', label: 'Beleza', icon: Eye },
    { id: 'quadros', label: 'Quadros', icon: Frame },
    { id: 'texto', label: 'Texto', icon: Type },
    { id: 'elementos', label: 'Elementos', icon: Shapes },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'mais', label: 'Mais', icon: MoreHorizontal }
];

interface SideNavProps {
    activeNav: NavItemId;
    setActiveNav: (id: NavItemId) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ activeNav, setActiveNav }) => {
    return (
        <nav className="
            flex flex-row md:flex-col 
            w-full md:w-20 
            h-16 md:h-auto 
            bg-[#212121]/95 md:bg-[#212121]/80 backdrop-blur-md 
            flex-shrink-0 z-30 
            md:rounded-xl shadow-2xl 
            overflow-x-auto md:overflow-visible
            border-t md:border-t-0 border-gray-700/50
        ">
            <div className="flex md:flex-col w-full min-w-max md:min-w-0">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={`
                            relative flex flex-col items-center justify-center 
                            p-1 md:p-2 
                            h-16 md:h-16 
                            min-w-[4.5rem] md:w-full 
                            transition-colors duration-200 
                            ${activeNav === item.id ? 'bg-[#2c2c2c]/80' : 'hover:bg-gray-700/50'}
                        `}
                        aria-label={item.label}
                        aria-current={activeNav === item.id}
                    >
                        {/* Active Indicator: Left border on Desktop, Top border on Mobile */}
                        {activeNav === item.id && (
                            <div className="
                                absolute 
                                md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-1 md:h-8 md:rounded-r-full 
                                top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full
                                bg-blue-500
                            "></div>
                        )}
                        
                        <item.icon 
                            size={22} 
                            className={`
                                mb-1 
                                transition-all duration-200 
                                ${activeNav === item.id ? 'text-blue-400 [filter:drop-shadow(0_0_3px_rgba(96,165,250,0.5))]' : 'text-gray-400'}
                            `} 
                        />
                        <span className={`text-[9px] md:text-[10px] ${activeNav === item.id ? 'text-white font-semibold' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
