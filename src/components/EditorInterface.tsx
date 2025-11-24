/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useEditor } from '../context/EditorContext'; // Caminho relativo corrigido
import Header from './Header';
import HomePage from './HomePage';
import ToolModal from './ToolModal';
import StartScreen from './StartScreen';
import EditorModalLayout from './EditorModalLayout';
import ComparisonModal from './ComparisonModal';
import { tools } from '../config/tools'; // Caminho relativo corrigido
import { optimizeImage } from '../utils/imageUtils'; // Caminho relativo corrigido

// Importação dos Painéis de Ferramentas (Caminhos relativos)
import SketchRenderPanel from './tools/SketchRenderPanel';
import ImageGenPanel from './tools/ImageGenPanel';
import CreativeFusionPanel from './tools/CreativeFusionPanel';
import OutpaintingPanel from './tools/OutpaintingPanel';
import ImageVariationPanel from './tools/ImageVariationPanel';
import ProductPhotographyPanel from './tools/ProductPhotographyPanel';
import CharacterDesignPanel from './tools/CharacterDesignPanel';
import ArchitecturalVizPanel from './tools/ArchitecturalVizPanel';
import InteriorDesignPanel from './tools/InteriorDesignPanel';
import FaceSwapPanel from './tools/FaceSwapPanel';
import AIPortraitPanel from './tools/AIPortraitPanel';
import VideoGenPanel from './tools/VideoGenPanel';

// Importação dos Painéis de Edição
import CropPanel from './tools/CropPanel';
import StylePanel from './tools/StylePanel';
import AdjustmentPanel from './tools/AdjustmentPanel';
import GenerativeEditPanel from './tools/GenerativeEditPanel';
import RemoveBgPanel from './tools/RemoveBgPanel';
import UpscalePanel from './tools/UpscalePanel';
import TextPanel from './tools/TextPanel';
import RelightPanel from './tools/RelightPanel';
import MagicPromptPanel from './tools/MagicPromptPanel';
import LowPolyPanel from './tools/LowPolyPanel';
import PortraitsPanel from './tools/PortraitsPanel';
import StyleGenPanel from './tools/StyleGenPanel';
import WonderPanel from './tools/WonderPanel';
import DustAndScratchesPanel from './tools/DustAndScratchesPanel';
import ExtractArtPanel from './tools/ExtractArtPanel';
import NeuralFiltersPanel from './tools/NeuralFiltersPanel';
import TrendsPanel from './tools/TrendsPanel';

// Componente AiMoviePosterScreen (Se estiver implementado em tools, importe de lá, ou da pasta screens se criou)
// Para evitar erros, vou mapear apenas o que temos certeza.

const toolMap: any = {
    sketchRender: { Component: SketchRenderPanel, title: 'Renderização de Esboço' },
    imageGen: { Component: ImageGenPanel, title: 'Gerador de Imagens AI' },
    creativeFusion: { Component: CreativeFusionPanel, title: 'Fusão Criativa' },
    outpainting: { Component: OutpaintingPanel, title: 'Pintura Expansiva' },
    imageVariation: { Component: ImageVariationPanel, title: 'Variação de Imagem' },
    productPhotography: { Component: ProductPhotographyPanel, title: 'Fotografia de Produto AI' },
    characterDesign: { Component: CharacterDesignPanel, title: 'Design de Personagem' },
    architecturalViz: { Component: ArchitecturalVizPanel, title: 'Visualização Arquitetônica' },
    interiorDesign: { Component: InteriorDesignPanel, title: 'Reforma de Interiores' },
    faceSwap: { Component: FaceSwapPanel, title: 'Troca de Rosto' },
    aiPortrait: { Component: AIPortraitPanel, title: 'Gerador de Retrato IA' },
    videoGen: { Component: VideoGenPanel, title: 'Gerador de Vídeo AI' },
    
    // Edição
    extractArt: { Component: ExtractArtPanel, title: 'Extrair Arte' },
    crop: { Component: CropPanel, title: 'Cortar e Girar' },
    adjust: { Component: AdjustmentPanel, title: 'Ajustes' },
    style: { Component: StylePanel, title: 'Estilos Artísticos' },
    generativeEdit: { Component: GenerativeEditPanel, title: 'Edição Generativa' },
    removeBg: { Component: RemoveBgPanel, title: 'Removedor de Fundo' },
    upscale: { Component: UpscalePanel, title: 'Melhorar Resolução' },
    text: { Component: TextPanel, title: 'Adicionar Texto' },
    relight: { Component: RelightPanel, title: 'Reacender' },
    magicPrompt: { Component: MagicPromptPanel, title: 'Prompt Mágico' },
    lowPoly: { Component: LowPolyPanel, title: 'Estilo Low Poly' },
    portraits: { Component: PortraitsPanel, title: 'Retratos IA' },
    styleGen: { Component: StyleGenPanel, title: 'Estilos Rápidos' },
    wonderModel: { Component: WonderPanel, title: 'Modelo Wonder' },
    dustAndScratches: { Component: DustAndScratchesPanel, title: 'Poeira e Arranhões' },
    neuralFilters: { Component: NeuralFiltersPanel, title: 'Filtros Neurais' },
    trends: { Component: TrendsPanel, title: 'Tendências' },
};

const editingTools = ['extractArt', 'crop', 'adjust', 'style', 'generativeEdit', 'removeBg', 'upscale', 'videoGen', 'text', 'relight', 'magicPrompt', 'lowPoly', 'portraits', 'styleGen', 'wonderModel', 'dustAndScratches', 'neuralFilters', 'trends'];

const EditorInterface: React.FC = () => {
    const { 
        activeTool, 
        currentImage, 
        setInitialImage,
        setIsLoading,
        setLoadingMessage,
        setError,
        isComparisonModalOpen,
        setIsComparisonModalOpen,
        originalImageUrl,
        currentImageUrl,
    } = useEditor();

    const currentToolInfo = activeTool ? toolMap[activeTool] : null;
    const isEditingToolActive = activeTool ? editingTools.includes(activeTool) : false;

    const handleFileSelect = async (file: File) => {
        if (file) {
            setIsLoading(true);
            setLoadingMessage("Otimizando imagem...");
            try {
                const optimizedFile = await optimizeImage(file);
                setInitialImage(optimizedFile);
            } catch (error) {
                console.error("Erro ao otimizar:", error);
                setError("Não foi possível processar a imagem.");
            } finally {
                setIsLoading(false);
                setLoadingMessage(null);
            }
        }
    };

    // Se for ferramenta de edição e não tiver imagem, mostra upload (exceto vídeo)
    if (isEditingToolActive && !currentImage && activeTool !== 'videoGen') {
        return (
            <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <StartScreen onFileSelect={handleFileSelect} />
                </main>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow overflow-y-auto">
                <HomePage />
            </main>
            
            {currentToolInfo && (
                <ToolModal title={currentToolInfo.title}>
                    {isEditingToolActive ? (
                        <EditorModalLayout />
                    ) : (
                        <currentToolInfo.Component />
                    )}
                </ToolModal>
            )}

            {originalImageUrl && currentImageUrl && (
                <ComparisonModal
                    isOpen={isComparisonModalOpen}
                    onClose={() => setIsComparisonModalOpen(false)}
                    beforeImage={originalImageUrl}
                    afterImage={currentImageUrl}
                />
            )}
        </div>
    );
};

export default EditorInterface;