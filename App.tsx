
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import EditorInterface from './components/EditorInterface';
import { EditorProvider, useEditor } from './contexts/EditorContext';

// Import screens
import { UpscalerScreen } from './screens/UpscalerScreen';
import { PortraitScreen } from './screens/PortraitScreen';
import { ImageGeneratorScreen } from './screens/ImageGeneratorScreen';
import { BackgroundRemoverScreen } from './screens/BackgroundRemoverScreen';
import { MagicEraserScreen } from './screens/MagicEraserScreen';
import { AiSkinRetouchScreen } from './screens/AiSkinRetouchScreen';
import { AiMagicEditScreen } from './screens/AiMagicEditScreen';

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
        case 'ai-portrait': return <PortraitScreen onBack={handleBack} initialImage={image} />;
        case 'ai-image-generator': return <ImageGeneratorScreen onBack={handleBack} onImageGenerated={handleEditComplete} />;
        case 'bg-remover': return <BackgroundRemoverScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'magic-eraser': return <MagicEraserScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-upscaler': return <UpscalerScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
        case 'ai-skin-retouch': return <AiSkinRetouchScreen onBack={handleBack} onEdit={handleEditComplete} />;
        case 'ai-magic-edit': return <AiMagicEditScreen onBack={handleBack} onEdit={handleEditComplete} initialImage={image} />;
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
