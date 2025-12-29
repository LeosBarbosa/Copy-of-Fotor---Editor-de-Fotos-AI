import React, { useState } from 'react';
import { ArrowLeft, Download, Scissors, Edit, Loader, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';

// Fix: Defined props for ArtExtractorScreen component
interface ArtExtractorScreenProps {
  onBack: () => void;
  onEdit: (imageUrl: string) => void;
  initialImage: string | null;
}

export const ArtExtractorScreen: React.FC<ArtExtractorScreenProps> = ({ onBack, onEdit, initialImage }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fix: Implemented handleExtractArt with proper aiService usage and prompt engineering
    const handleExtractArt = async () => {
        if (!initialImage) return;
        setIsProcessing(true);
        setError(null);
        const prompt = `
        ATUE COMO UM ESPECIALISTA EM PRÉ-IMPRESSÃO E DESIGN GRÁFICO.
        OBJETIVO: Extrair e restaurar o design gráfico desta imagem para impressão profissional (DTF/Serigrafia).
        
        AÇÕES OBRIGATÓRIAS:
        1. ISOLAMENTO: Remova completamente o fundo, o manequim, a pele humana e o tecido da camiseta. Mantenha APENAS a tinta/arte.
        2. CORREÇÃO: Remova dobras, amassados e distorções de perspectiva causadas pelo tecido. A arte deve ficar plana (flat).
        3. OTIMIZAÇÃO: Aumente o contraste e a saturação para cores vibrantes de impressão. Elimine ruído.
        4. RESOLUÇÃO: Gere a saída em ultra-alta definição sobre fundo transparente (canal alfa estrito).
        5. RESPEITO: Mantenha a tipografia e os traços originais com fidelidade absoluta. Não alucine novos elementos.
        
        Se houver texto, garanta que esteja legível e nítido.`;
        
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
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <header className="flex-shrink-0 z-10 p-4 border-b border-gray-800 bg-[#2c2c2c]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-semibold text-lg">Extrator de Arte Profissional</h1>
                </div>
            </header>

            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
                {isProcessing ? (
                    <div className="text-center">
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="font-semibold text-gray-300">Isolando e restaurando design...</p>
                    </div>
                ) : processedImage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                         <div className="relative max-w-full max-h-[70vh] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-lg overflow-hidden border border-gray-700">
                             <img src={processedImage} alt="Arte Extraída" className="max-w-full max-h-full object-contain"/>
                         </div>
                         <div className="flex gap-4">
                             <button onClick={() => onEdit(processedImage)} className="bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors">
                                 <Edit size={18} /> Continuar Editando
                             </button>
                             <button onClick={() => {
                                 const link = document.createElement('a');
                                 link.href = processedImage;
                                 link.download = `arte-extraida-${Date.now()}.png`;
                                 link.click();
                             }} className="bg-blue-600 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-bold">
                                 <Download size={18} /> Baixar PNG Transparente
                             </button>
                         </div>
                    </div>
                ) : (
                    <div className="text-center max-w-lg p-8 bg-[#2c2c2c] rounded-2xl border border-gray-800">
                        <Scissors size={48} className="mx-auto text-blue-400 mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Extrator de Estampas IA</h2>
                        <p className="text-gray-400 mb-8">Extraia logos e artes de fotos de camisetas ou produtos. Ideal para restaurar designs antigos para novas impressões.</p>
                        {initialImage ? (
                            <div className="space-y-6">
                                <div className="relative group">
                                    <img src={initialImage} alt="Original" className="max-h-48 mx-auto rounded-lg border border-gray-700" />
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                                </div>
                                <button onClick={handleExtractArt} className="bg-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 w-full shadow-lg shadow-blue-900/20">
                                    Extrair Arte Profissional
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
                                <p className="text-yellow-500 text-sm italic">Por favor, carregue uma imagem no editor primeiro para usar esta ferramenta.</p>
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