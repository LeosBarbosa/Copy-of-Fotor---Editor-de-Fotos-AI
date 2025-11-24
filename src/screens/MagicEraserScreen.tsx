
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Wand, Edit, Eraser, ZoomIn, ZoomOut } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const CanvasEditor: React.FC<{
    image: string;
    brushSize: number;
    onMaskChange: (mask: string) => void;
    zoom: number;
}> = ({ image, brushSize, onMaskChange, zoom }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const maskCtx = maskCanvas?.getContext('2d');
        if (!canvas || !ctx || !maskCanvas || !maskCtx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = image;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        };
    }, [image]);

    const getCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const maskCanvas = maskCanvasRef.current;
        if (maskCanvas) {
            onMaskChange(maskCanvas.toDataURL('image/png'));
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const maskCtx = maskCanvasRef.current?.getContext('2d');
        if (!maskCtx) return;
        const { x, y } = getCoords(e);
        maskCtx.fillStyle = 'white';
        maskCtx.beginPath();
        maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        maskCtx.fill();

        const canvasCtx = canvasRef.current?.getContext('2d');
        if (canvasCtx) {
            canvasCtx.globalAlpha = 0.5;
            canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            canvasCtx.fill();
            canvasCtx.globalAlpha = 1.0;
        }
    };

    return (
        <div className="w-full h-full overflow-auto flex items-center justify-center">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            />
            <canvas ref={maskCanvasRef} className="hidden" />
        </div>
    );
};

export const MagicEraserScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; initialImage: string | null; }> = ({ onBack, onEdit, initialImage }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [brushSize, setBrushSize] = useState(40);
    const [zoom, setZoom] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialImage && !originalImage) {
            setOriginalImage(initialImage);
        }
    }, [initialImage, originalImage]);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalImage(e.target?.result as string);
            setProcessedImage(null);
            setMaskImage(null);
            setZoom(1);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
    };

    const handleApply = async () => {
        if (!originalImage || !maskImage) {
            setError('Por favor, carregue uma imagem e marque a área a ser removida.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const { base64: originalB64, mimeType: originalMime } = await imageUrlToBase64(originalImage);
            const { base64: maskB64, mimeType: maskMime } = await imageUrlToBase64(maskImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = "Use a segunda imagem como uma máscara. Remova a área da primeira imagem que corresponde às partes brancas da máscara. Preencha a área removida de forma realista e contínua, combinando com o fundo e a textura circundantes (Inpainting).";
            
            const response = await ai.models.generateContent({
                model: AI_IMAGE_MODEL,
                contents: {
                    parts: [
                        { inlineData: { data: originalB64, mimeType: originalMime } },
                        { inlineData: { data: maskB64, mimeType: maskMime } },
                        { text: prompt },
                    ],
                },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            if (!candidate) {
                throw new Error("A IA não retornou candidatos. Tente novamente.");
            }

            const parts = candidate?.content?.parts || [];
            let imageFound = false;

            for (const part of parts) {
              if (part.inlineData) {
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setProcessedImage(imageUrl);
                imageFound = true;
                break;
              }
            }
            if (!imageFound) {
                const textResponse = candidate?.content?.parts?.[0]?.text;
                if (textResponse) {
                    throw new Error(`A IA respondeu apenas com texto: "${textResponse.substring(0, 100)}..."`);
                }
                 if (candidate?.finishReason) {
                     throw new Error(`Geração bloqueada. Motivo: ${candidate.finishReason}`);
                }
                throw new Error("A IA não retornou uma imagem.");
            }
        } catch (err: any) {
            console.error("Erro na Borracha Mágica:", err);
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED')) {
                setError("Erro de permissão: O modelo selecionado não está disponível para sua conta. Tente usar o modelo padrão.");
            } else {
                setError(err.message || "Falha ao processar a imagem. Tente novamente.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `apagado-magicamente-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
             <style>{`.bg-checkered { background-color: #f0f2f5; background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }`}</style>
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            
            <div className="relative flex-1 overflow-hidden">
                <main className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                    {isProcessing ? (
                        <div className="absolute inset-0 bg-zinc-900/80 z-20 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                            <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-white font-semibold text-lg drop-shadow-md">Fazendo mágica...</h3>
                            <p className="text-gray-300 text-sm mt-1 drop-shadow-md">Removendo objeto e reconstruindo a imagem.</p>
                        </div>
                    ) : null}

                    {processedImage ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <img src={processedImage} alt="Resultado" className="max-w-full max-h-full object-contain rounded-lg"/>
                        </div>
                    ) : originalImage ? (
                        <CanvasEditor image={originalImage} brushSize={brushSize} onMaskChange={setMaskImage} zoom={zoom} />
                    ) : (
                        <div className="text-center p-4">
                            <Wand size={48} className="mx-auto text-blue-400 mb-4"/>
                            <h2 className="text-3xl font-bold mb-2">Borracha Mágica IA</h2>
                            <p className="text-gray-400 mb-6">Apague objetos indesejados de suas fotos.</p>
                            <button onClick={() => inputRef.current?.click()} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-blue-700">
                                <Upload size={20} /> Carregar Imagem
                            </button>
                        </div>
                    )}
                </main>

                <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="font-semibold text-lg drop-shadow-md">Borracha Mágica IA</h1>
                        </div>
                    </div>
                </header>

                <footer className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    {error && <div className="max-w-md mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                    
                    {processedImage ? (
                        <div className="max-w-md mx-auto flex items-center justify-center gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700/80"> <Edit size={18} /> Editar </button>
                            <button onClick={handleDownload} className="bg-blue-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700/80"> <Download size={18} /> Baixar </button>
                        </div>
                    ) : originalImage ? (
                        <div className="max-w-lg mx-auto flex items-center gap-6 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            <div className="flex-1">
                                <label className="text-sm text-gray-300">Tamanho do Pincel: {brushSize}px</label>
                                <input type="range" min="10" max="150" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full mt-1" />
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-md">
                                <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="p-2"><ZoomOut size={18}/></button>
                                <span className="text-sm w-12 text-center" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2"><ZoomIn size={18}/></button>
                            </div>
                            <button onClick={handleApply} disabled={isProcessing} className="bg-blue-600 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500">
                                <Eraser size={18} /> Aplicar
                            </button>
                        </div>
                    ) : null}
                </footer>
            </div>
        </div>
    );
};
