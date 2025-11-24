
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { EditorInterface } from './components/EditorInterface';
import { EditorProvider, useEditor } from './contexts/EditorContext';

// Import screens
import { UpscalerScreen } from './screens/UpscalerScreen';
import { PortraitScreen } from './features/portrait/PortraitScreen';
import { NoiseRemoverScreen } from './screens/NoiseRemoverScreen';
import { ColorizeScreen } from './screens/ColorizeScreen';
import { ImageGeneratorScreen } from './features/image-gen/ImageGeneratorScreen';
import { OneTapEnhanceScreen } from './screens/OneTapEnhanceScreen';
import { BackgroundRemoverScreen } from './screens/BackgroundRemoverScreen';
import { AiSkinRetouchScreen } from './screens/AiSkinRetouchScreen';
import { MagicEraserScreen } from './screens/MagicEraserScreen';
import { FaceBlurScreen } from './screens/FaceBlurScreen';
import { WatermarkRemoverScreen } from './screens/WatermarkRemoverScreen';
import { BackgroundBlurScreen } from './screens/BackgroundBlurScreen';
import { ChangeBackgroundScreen } from './screens/ChangeBackgroundScreen';
import { OldPhotoRestorerScreen } from './screens/OldPhotoRestorerScreen';
import { OcrScreen } from './screens/OcrScreen';
import { HeadshotScreen } from './screens/HeadshotScreen';
import { ImageExpandScreen } from './screens/ImageExpandScreen';
import { AiReplaceScreen } from './screens/AiReplaceScreen';
import { AiBackgroundScreen } from './screens/AiBackgroundScreen';
import { VirtualTattooScreen } from './screens/VirtualTattooScreen';
import { Upcoming2026Screen } from './screens/Upcoming2026Screen';
import { CinematicPortraitScreen } from './screens/CinematicPortraitScreen';
import { AiMagicEditScreen } from './screens/AiMagicEditScreen';
import { ImageAnalysisScreen } from './screens/ImageAnalysisScreen';
import { ColoringBookScreen } from './screens/ColoringBookScreen';
import { LifestyleSceneScreen } from './screens/LifestyleSceneScreen';
import { FutureFamilyScreen } from './screens/FutureFamilyScreen';
import { AiMoviePosterScreen } from './screens/AiMoviePosterScreen';

// Wrapper component to handle routing logic for tools
const ToolRouteHandler: React.FC = () => {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    const { image, setImage, addToHistory } = useEditor();

    const handleBack = () => navigate('/');
    
    const handleEditComplete = (imageUrl: string) => {
        addToHistory(imageUrl); // Save to history directly
        navigate('/');
    };

    // Tools that don't necessarily require an existing image in the editor (Generators)
    const standaloneTools = ['ai-image-generator', 'future-family', 'ai-movie-poster'];
    
    // If no image is loaded and tool is not standalone, redirect to home
    if (!image && !standaloneTools.includes(toolId || '')) {
        // Optional: You could redirect to a specific upload page, but for now home is safer
        // return <Navigate to="/" replace />;
    }

    switch (toolId) {
        case 'ai-magic-edit': return <AiMagicEditScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'image-analysis': return <ImageAnalysisScreen onBack={handleBack} initialImage={image} />;
        case 'ai-image-generator': return <ImageGeneratorScreen onBack={handleBack} onImageGenerated={handleEditComplete} />;
        case 'one-tap-enhance': return <OneTapEnhanceScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'bg-remover': return <BackgroundRemoverScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-upscaler': return <UpscalerScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-portrait': return <PortraitScreen onBack={handleBack} initialImage={image} />; // Portrait handles its own saving/flow usually
        case 'ai-noise-remover': return <NoiseRemoverScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'colorize': return <ColorizeScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-skin-retouch': return <AiSkinRetouchScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'magic-eraser': return <MagicEraserScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'face-blur': return <FaceBlurScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'watermark-remover': return <WatermarkRemoverScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'bg-blur': return <BackgroundBlurScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'change-bg': return <ChangeBackgroundScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'old-photo-restorer': return <OldPhotoRestorerScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ocr': return <OcrScreen onBack={handleBack} />;
        case 'ai-headshot': return <HeadshotScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-expand': return <ImageExpandScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-replace': return <AiReplaceScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-bg': return <AiBackgroundScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'virtual-tattoo': return <VirtualTattooScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'upcoming-2026': return <Upcoming2026Screen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'cinematic-portrait': return <CinematicPortraitScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'coloring-book': return <ColoringBookScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'lifestyle-scene': return <LifestyleSceneScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'future-family': return <FutureFamilyScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-movie-poster': return <AiMoviePosterScreen onBack={handleBack} onEdit={handleEditComplete} />;
        default: return <Navigate to="/" replace />;
    }
};

const App: React.FC = () => {
    return (
        <EditorProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<EditorInterface />} />
                    <Route path="/tool/:toolId" element={<ToolRouteHandler />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </EditorProvider>
    );
};

export default App;
