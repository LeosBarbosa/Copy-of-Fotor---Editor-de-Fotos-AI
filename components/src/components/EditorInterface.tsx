/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { Header } from './layout/Header';
import HomePage from './HomePage';
import ToolModal from './ToolModal';
import StartScreen from './StartScreen';
import EditorModalLayout from './EditorModalLayout';
import ComparisonModal from './ComparisonModal';
import { tools } from '../config/tools';
import { optimizeImage } from '../utils/imageUtils';

// Import existing panels with NAMED imports
// import { CropPanel } from './panels/CropPanel'; 
import { TextPanel } from './TextPanel';
import { AdjustPanel } from './AdjustPanel';
import { LightingPanel } from './LightingPanel';
import { BeautyPanel } from './BeautyPanel';
import { AiAgeChangerPanel } from './AiAgeChangerPanel';
import { FaceEnhancePanel } from './FaceEnhancePanel';
import { StructurePanel } from './StructurePanel';
import { HslPanel } from './HslPanel';
import { VirtualTryOnPanel } from './VirtualTryOnPanel';
import { ElementsPanel } from './ElementsPanel';
import { FramePanel } from './FramePanel';

// Define the map of tool IDs to their panel components
const toolMap: any = {
    // Basic Editing
    'crop': { Component: null, title: 'Crop & Rotate' }, 
    'adjust': { Component: AdjustPanel, title: 'Adjustments' },
    'text': { Component: TextPanel, title: 'Add Text' },
    'relight': { Component: LightingPanel, title: 'Relight' },
    
    // AI / Effects
    'beauty': { Component: BeautyPanel, title: 'Beauty' },
    'age-changer': { Component: AiAgeChangerPanel, title: 'Age Changer' },
    'face-enhance': { Component: FaceEnhancePanel, title: 'Face Enhance' },
    'structure': { Component: StructurePanel, title: 'Structure' },
    'hsl': { Component: HslPanel, title: 'HSL Color' },
    'virtual-try-on': { Component: VirtualTryOnPanel, title: 'Virtual Try-On' },
    'elements': { Component: ElementsPanel, title: 'Elements' },
    'frames': { Component: FramePanel, title: 'Frames' },
};

// Tools that trigger the editor modal interface
const editingTools = Object.keys(toolMap);

const EditorInterface: React.FC = () => {
    const { 
        image: currentImage, 
        setImage: setInitialImage,
        // setIsLoading,
        // setLoadingMessage,
        // setError,
        originalImage: originalImageUrl,
        isComparisonModalOpen, // This needs to be in context or state
        setIsComparisonModalOpen, // This needs to be in context or state
    } = useEditor() as any; // Cast to any because context might be missing some props used here

    // Temporary state for missing context items if needed, or derived
    const activeTool = window.location.pathname.split('/tool/')[1]; // Simple router check
    const currentToolInfo = activeTool ? toolMap[activeTool] : null;
    const isEditingToolActive = activeTool ? editingTools.includes(activeTool) : false;

    // Helper for file select
    const handleFileSelect = async (file: File) => {
        if (file) {
             // setIsLoading(true);
            try {
                const optimizedFile = await optimizeImage(file);
                setInitialImage(optimizedFile);
            } catch (error) {
                console.error("Error optimizing:", error);
                // setError("Could not process image.");
            } finally {
                // setIsLoading(false);
            }
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow overflow-y-auto">
                <HomePage />
            </main>
        </div>
    );
};

export default EditorInterface;
