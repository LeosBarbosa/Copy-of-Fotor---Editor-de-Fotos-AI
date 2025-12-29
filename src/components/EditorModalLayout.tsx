import React from 'react';
import { useEditor } from '../contexts/EditorContext';

const EditorModalLayout: React.FC = () => {
    const { image } = useEditor();

    return (
        <div className="flex h-full">
            <div className="flex-grow bg-gray-900 flex items-center justify-center p-4">
                {image ? (
                    <img src={image} alt="Editing" className="max-h-full max-w-full object-contain" />
                ) : (
                    <p className="text-gray-500">No image loaded</p>
                )}
            </div>
            <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
                <h3 className="font-semibold mb-4">Tools</h3>
                <p className="text-sm text-gray-400">Tool controls will appear here.</p>
            </div>
        </div>
    );
};

export default EditorModalLayout;
