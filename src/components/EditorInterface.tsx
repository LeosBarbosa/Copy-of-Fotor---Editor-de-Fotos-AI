import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { Header } from './layout/Header';
import HomePage from './HomePage';

// Fix: Replaced broken snippet with a valid React component module
const EditorInterface: React.FC = () => {
    const { image } = useEditor();
    
    return (
        <div className="h-screen bg-[#111317] text-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow overflow-y-auto">
                {/* 
                  HomePage handles the display of the tool grid 
                  when no specific tool screen is active from the router.
                */}
                <HomePage />
            </main>
        </div>
    );
};

export default EditorInterface;