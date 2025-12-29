import React, { useState } from 'react';
import { ArrowLeft, Download, Scissors, Edit, Loader, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService.ts';

interface ArtExtractorScreenProps {
  onBack: () => void;
  onEdit: (imageUrl: string) => void;
  initialImage: string | null;
}

export const ArtExtractorScreen: React.FC<ArtExtractorScreenProps> = ({ onBack, onEdit, initialImage }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleExtractArt = async () => {
        if (!initialImage) return;
        setIsProcessing(true);
        setError(null);
        
        const prompt = `
        TASK: GRAPHIC DESIGN EXTRACTION.
        OBJECTIVE: Extract the graphic design from this product photo for professional DTF/Screen printing.
        
        REQUIRED ACTIONS:
        1. ISOLATION: Completely remove the background, the mannequin, human skin, and the garment fabric. Keep ONLY the ink design/graphic art.
        2. PERSPECTIVE: Remove wrinkles and perspective distortions caused by the fabric. The art must be flat.
        3. TRANSPARENCY: Output the result as a high-definition PNG on a strictly transparent background (alpha channel).
        4. FIDELITY: Maintain original typography, strokes, and colors with absolute accuracy. Do not add or hallucinate new elements.
        `;
        
        try {
            const result = await aiService.generateImage({
                image: initialImage,
                prompt: prompt,
                model: 'gemini-2.5-flash-image'
            });
            setProcessedImage(result);
        } catch (err: any) {
            setError(err.message || "Falha ao extrair arte.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#111317] text-white overflow-hidden">
            <header className="flex-shrink-0 z-10 p-4 border-b border-gray-800 bg-[#1a1c20]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg">Extrator de Estampa DTF</h1>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 bg-checkered">
                {isProcessing ? (
                    <div className="text-center p-12 bg-[#1a1c20] rounded-2xl border border-gray-800 shadow-2xl">
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="font-bold text-xl mb-2">Processando Design...</p>
                        <p className="text-gray-400 text-sm">Isolando a arte das fibras do tecido e corrigindo perspectiva.</p>
                    </div>
                ) : processedImage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                         <div className="relative max-w-full max-h-[65vh] p-8 bg-[#1a1c20]/50 rounded-2xl border border-gray-700 shadow-2xl overflow-auto">
                             <img src={processedImage} alt="Arte Extraída" className="max-w-full h-auto object-contain mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"/>
                         </div>
                         <div className="flex flex-wrap justify-center gap-4">
                             <button onClick={() => onEdit(processedImage)} className="bg-gray-700 px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-600 transition-all font-semibold">
                                 <Edit size={18} /> Continuar Editando
                             </button>
                             <button onClick={() => {
                                 const link = document.createElement('a');
                                 link.href = processedImage;
                                 link.download = `estampa-dtf-${Date.now()}.png`;
                                 link.click();
                             }} className="bg-blue-600 px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-900/20">
                                 <Download size={18} /> Baixar PNG Transparente
                             </button>
                         </div>
                    </div>
                ) : (
                    <div className="text-center max-w-lg p-10 bg-[#1a1c20] rounded-3xl border border-gray-800 shadow-2xl">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/30">
                            <Scissors size={40} className="text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight">Converter Camiseta em Arte</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">Extraia logos e estampas de fotos reais para arquivos de impressão limpos. Perfeito para restaurar designs ou criar arquivos fonte para DTF.</p>
                        
                        {initialImage ? (
                            <div className="space-y-6">
                                <div className="relative group max-w-[200px] mx-auto">
                                    <img src={initialImage} alt="Original" className="w-full h-auto rounded-xl border border-gray-700 shadow-md" />
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                                </div>
                                <button onClick={handleExtractArt} className="bg-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 w-full shadow-lg shadow-blue-900/40">
                                    EXTRAIR AGORA
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                <p className="text-blue-400 text-sm font-medium">Por favor, carregue uma imagem no editor primeiro para usar esta ferramenta.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            {error && (
                <div className="p-4 bg-red-900/80 text-red-100 text-center flex items-center justify-center gap-2 border-t border-red-700 backdrop-blur-md">
                    <AlertCircle size={18}/> 
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
};