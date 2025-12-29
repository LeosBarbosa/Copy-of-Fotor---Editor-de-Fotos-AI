
import React from 'react';
import { NavItem as NavItemType, NavItemId } from '../../types';
import { Sparkles, Settings, Wand, Eye, Frame, Type, Shapes, Upload, MoreHorizontal } from 'lucide-react';

const navItems: NavItemType[] = [
    { id: 'ferramentas', label: 'Ferramentas', icon: Sparkles },
    { id: 'ajustar', label: 'Ajustar', icon: Settings },
    { id: 'efeitos', label: 'Efeitos', icon: Wand },
    { id: 'beleza', label: 'Beleza', icon: Eye },
    { id: 'texto', label: 'Texto', icon: Type },
    { id: 'elementos', label: 'Elementos', icon: Shapes },
    { id: 'uploads', label: 'Uploads', icon: Upload },
];

interface SideNavProps {
    activeNav: NavItemId;
    setActiveNav: (id: NavItemId) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ activeNav, setActiveNav }) => {
    return (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-[#111317]/95 backdrop-blur-xl border-t border-gray-800 md:relative md:w-20 md:h-full md:border-t-0 md:border-r z-40">
            <div className="flex md:flex-col h-full items-center justify-around md:justify-start md:pt-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={`relative flex flex-col items-center justify-center p-2 md:w-full md:h-16 transition-all duration-300 ${
                            activeNav === item.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                        aria-label={item.label}
                    >
                        {activeNav === item.id && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-b-full md:top-1/2 md:left-0 md:w-1 md:h-8 md:translate-x-0 md:-translate-y-1/2 md:rounded-r-full"></div>
                        )}
                        <item.icon size={22} className={`${activeNav === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                        <span className="text-[9px] mt-1 font-bold md:hidden lg:block">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
