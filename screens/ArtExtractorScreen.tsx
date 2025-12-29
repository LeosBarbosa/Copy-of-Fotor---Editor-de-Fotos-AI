import React, { useState } from 'react';
import { ArrowLeft, Download, Scissors, Edit, Loader, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';

export const ArtExtractorScreen: React.FC<{ 
    onBack: () => void; 
    onEdit: (url: string) => void; 
    initialImage: string | null 
}> = ({ onBack, onEdit, initialImage }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const extract = async () => {
        if (!initialImage) return;
        setIsProcessing(true);
        setError(null);
        
        const prompt = `
        TASK: GRAPHIC DESIGN EXTRACTION.
        1. Remove the background, the garment fabric, the model, and shadows.
        2. Keep ONLY the ink design/graphic art.
        3. Flatten the perspective to create a 2D source file.
        4. Output as a clean PNG on a strictly transparent background.
        5. Fidelity: Do not add or hallucinate new elements. Maintain typography and strokes.
        `;

        try {
            const url = await aiService.generateImage({
                prompt,
                image: initialImage,
                model: 'gemini-2.5-flash-image'
            });
            setResult(url);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#1F1F1F]">
            <header className="p-4 border-b border-gray-800 flex items-center gap-4 bg-[#2c2c2c]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={20}/></button>
                <h1 className="font-bold">Extrator de Estampa DTF</h1>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-blue-500" size={40}/>
                        <p className="text-gray-400">Isolando a arte do tecido...</p>
                    </div>
                ) : result ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="bg-checkered p-4 rounded-lg border border-gray-700 max-h-[60vh] overflow-hidden">
                            <img src={result} className="max-h-full object-contain" alt="Resultado"/>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => onEdit(result)} className="bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2">
                                <Edit size={18}/> Continuar
                            </button>
                            <a href={result} download="estampa-dtf.png" className="bg-blue-600 px-6 py-2 rounded-lg flex items-center gap-2 font-bold">
                                <Download size={18}/> Baixar PNG
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center max-w-md">
                        <Scissors size={60} className="mx-auto text-blue-400 mb-6"/>
                        <h2 className="text-2xl font-bold mb-2">Converter Foto em Arte</h2>
                        <p className="text-gray-400 mb-8">Transforme uma foto de uma camiseta em um arquivo de estampa limpo com fundo transparente.</p>
                        <button onClick={extract} className="w-full bg-blue-600 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                            EXTRAIR ESTAMPA AGORA
                        </button>
                    </div>
                )}
                {error && <div className="mt-4 p-3 bg-red-900/20 text-red-400 border border-red-900/50 rounded flex gap-2 items-center"><AlertCircle size={16}/> {error}</div>}
            </main>
        </div>
    );
};