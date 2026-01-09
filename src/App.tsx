import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import EditorInterface from './components/EditorInterface.tsx';
import { EditorProvider, useEditor } from './contexts/EditorContext.tsx';

// Import screens using clean relative paths with extensions
import { UpscalerScreen } from './screens/UpscalerScreen.tsx';
import { PortraitScreen } from './screens/features/portrait/PortraitScreen.tsx';
import { NoiseRemoverScreen } from './screens/NoiseRemoverScreen.tsx';
import { ColorizeScreen } from './screens/ColorizeScreen.tsx';
import { ImageGeneratorScreen } from './screens/features/image-gen/ImageGeneratorScreen.tsx';
import { OneTapEnhanceScreen } from './screens/OneTapEnhanceScreen.tsx';
import { BackgroundRemoverScreen } from './screens/BackgroundRemoverScreen.tsx';
import { AiSkinRetouchScreen } from './screens/AiSkinRetouchScreen.tsx';
import { MagicEraserScreen } from './screens/MagicEraserScreen.tsx';
import { FaceBlurScreen } from './screens/FaceBlurScreen.tsx';
import { WatermarkRemoverScreen } from './screens/WatermarkRemoverScreen.tsx';
import { BackgroundBlurScreen } from './screens/BackgroundBlurScreen.tsx';
import { ChangeBackgroundScreen } from './screens/ChangeBackgroundScreen.tsx';
import { OldPhotoRestorerScreen } from './screens/OldPhotoRestorerScreen.tsx';
import { OcrScreen } from './screens/OcrScreen.tsx';
import { HeadshotScreen } from './screens/HeadshotScreen.tsx';
import { ImageExpandScreen } from './screens/ImageExpandScreen.tsx';
import { AiReplaceScreen } from './screens/AiReplaceScreen.tsx';
import { AiBackgroundScreen } from './screens/AiBackgroundScreen.tsx';
import { VirtualTattooScreen } from './screens/VirtualTattooScreen.tsx';
import { Upcoming2026Screen } from './screens/Upcoming2026Screen.tsx';
import { CinematicPortraitScreen } from './screens/CinematicPortraitScreen.tsx';
import { AiMagicEditScreen } from './screens/AiMagicEditScreen.tsx';
import { ImageAnalysisScreen } from './screens/ImageAnalysisScreen.tsx';
import { ColoringBookScreen } from './screens/ColoringBookScreen.tsx';
import { LifestyleSceneScreen } from './screens/LifestyleSceneScreen.tsx';
import { FutureFamilyScreen } from './screens/FutureFamilyScreen.tsx';
import AiMoviePosterScreen from './screens/AiMoviePosterScreen.tsx';
import { ArtExtractorScreen } from './screens/ArtExtractorScreen.tsx';

const ToolRouteHandler: React.FC = () => {
    const { toolId } = useParams<{ toolId: string }>();
    const navigate = useNavigate();
    const { image, addToHistory } = useEditor();

    const handleBack = () => navigate('/');
    
    const handleEditComplete = (imageUrl: string) => {
        addToHistory(imageUrl);
        navigate('/');
    };

    switch (toolId) {
        case 'ai-magic-edit': return <AiMagicEditScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'image-analysis': return <ImageAnalysisScreen onBack={handleBack} initialImage={image} />;
        case 'ai-image-generator': return <ImageGeneratorScreen onBack={handleBack} onImageGenerated={handleEditComplete} />;
        case 'one-tap-enhance': return <OneTapEnhanceScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'bg-remover': return <BackgroundRemoverScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-upscaler': return <UpscalerScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-portrait': return <PortraitScreen onBack={handleBack} initialImage={image} />;
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
        case 'art-extractor': return <ArtExtractorScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
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