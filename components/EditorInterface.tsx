import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { Header } from './layout/Header';
import HomePage from './HomePage';
import { UploaderScreen } from './UploaderScreen';

const EditorInterface: React.FC = () => {
    const { image, loadImage } = useEditor();
    
    return (
        <div className="h-screen bg-[#111317] text-gray-100 flex flex-col overflow-hidden">
            <Header onUploadClick={() => document.getElementById('main-upload')?.click()} />
            <main className="flex-grow overflow-y-auto">
                {!image ? (
                    <UploaderScreen onImageSelect={loadImage} />
                ) : (
                    <HomePage />
                )}
            </main>
            <input 
                id="main-upload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) loadImage(URL.createObjectURL(file));
                }} 
            />
        </div>
    );
};

export default EditorInterface;