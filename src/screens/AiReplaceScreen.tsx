
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Replace, Edit, Eraser } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

const CanvasEditor: React.FC<{
    image: string;
    brushSize: number;
    onMaskChange: (mask: string) => void;
}> = ({ image, brushSize, onMaskChange }) => {
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
            const container = canvas.parentElement!;
            const containerRatio = container.clientWidth / container.clientHeight;
            const imgRatio = img.width / img.height;
            
            let drawWidth, drawHeight;
            if(imgRatio > containerRatio) {
                drawWidth = container.clientWidth;
                drawHeight = container.clientWidth / imgRatio;
            } else {
                drawHeight = container.clientHeight;
                drawWidth = container.clientHeight * imgRatio;
            }

            canvas.width = drawWidth;
            canvas.height = drawHeight;
            maskCanvas.width = img.width; 
            maskCanvas.height = img.height;
            
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        };
    }, [image]);

    const getCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent) => { setIsDrawing(true); draw(e); };
    const stopDrawing = () => {
        setIsDrawing(false);
        const maskCanvas = maskCanvasRef.current;
        if (maskCanvas) onMaskChange(maskCanvas.toDataURL('image/png'));
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        const canvasCtx = canvas?.getContext('2d');
        const maskCtx = maskCanvas?.getContext('2d');
        if (!canvasCtx || !maskCtx || !canvas) return;

        const { x, y } = getCoords(e);
        
        canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        canvasCtx.fill();
        
        const scaleX = maskCanvas.width / canvas.width;
        const scaleY = maskCanvas.height / canvas.height;
        maskCtx.fillStyle = 'white';
        maskCtx.beginPath();
        maskCtx.arc(x * scaleX, y * scaleY, (brushSize / 2) * scaleX, 0, Math.PI * 2);
        maskCtx.fill();
    };

    return (
        <div className="w-full h-full bg-checkered flex items-center justify-center">
             <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} className="cursor-crosshair max-w-full max-h-full object-contain" />
             <canvas ref={maskCanvasRef} className="hidden" />
        </div>
    );
};


export const AiReplaceScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; }> = ({ onBack, onEdit }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [brushSize, setBrushSize] = useState(40);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleApply = async () => {
        if (!originalImage || !maskImage || !prompt) {
            setError('Carregue uma imagem, pinte uma área e descreva a substituição.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const { base64: originalB64, mimeType: originalMime } = await imageUrlToBase64(originalImage);
            const { base64: maskB64, mimeType: maskMime } = await imageUrlToBase64(maskImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const fullPrompt = `Use a segunda imagem como uma máscara. Na primeira imagem, substitua a área correspondente às partes brancas da máscara pelo seguinte: "${prompt}". Combine a substituição perfeitamente com o resto da imagem em termos de iluminação, estilo e perspectiva.`;
            
            const response = await ai.models.generateContent({
                model: AI_IMAGE_MODEL,
                contents: { parts: [
                    { inlineData: { data: originalB64, mimeType: originalMime } },
                    { inlineData: { data: maskB64, mimeType: maskMime } },
                    { text: fullPrompt },
                ]},
                config: { responseModalities: [Modality.IMAGE] },
            });

            const candidate = response.candidates?.[0];
            const parts = candidate?.content?.parts || [];
            let imageFound = false;
            for (const part of parts) {
                if (part.inlineData) {
                    setProcessedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    imageFound = true;
                    break;
                }
            }
            if (!imageFound) {
                const text = candidate?.content?.parts?.[0]?.text;
                if (text) throw new Error(`Falha: ${text}`);
                throw new Error("A IA não retornou uma imagem.");
            }

        } catch (err: any) {
            console.error("Erro na Substituição com IA:", err);
            setError(err.message || "Falha ao processar a imagem.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalImage(e.target?.result as string);
            setProcessedImage(null);
            setMaskImage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
    };

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `substituicao-ia-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
             <style>{`.bg-checkered { background-color: #444; background-image: linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }`}</style>
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div className="relative flex-1 overflow-hidden">
                <main className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                    {isProcessing ? (
                        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div><p>Substituindo e renderizando...</p></div>
                    ) : processedImage ? (
                        <div className="w-full h-full flex items-center justify-center p-4"><img src={processedImage} alt="Resultado" className="max-w-full max-h-full object-contain p-4"/></div>
                    ) : originalImage ? (
                        <CanvasEditor image={originalImage} brushSize={brushSize} onMaskChange={setMaskImage} />
                    ) : (
                        <div className="text-center p-4">
                            <Replace size={48} className="mx-auto text-blue-400 mb-4"/>
                            <h2 className="text-3xl font-bold mb-2">Substituição com IA</h2>
                            <p className="text-gray-400 mb-6">Pinte uma área e diga à IA o que gerar no lugar.</p>
                            <button onClick={() => inputRef.current?.click()} className="bg-blue-600 font-bold py-3 px-8 rounded-full flex items-center gap-2">
                                <Upload size={20} /> Carregar Imagem
                            </button>
                        </div>
                    )}
                </main>
                
                <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-semibold text-lg drop-shadow-md">Substituição com IA</h1>
                    </div>
                </header>

                <footer className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    {error && <div className="max-w-xl mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                    {originalImage && (
                        <div className="max-w-xl mx-auto flex flex-col gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm">Tamanho do Pincel: {brushSize}px</label>
                                    <input type="range" min="10" max="150" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full mt-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Descreva a substituição</label>
                                    <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: um gato de óculos" className="w-full mt-2 bg-gray-700/50 p-2 rounded-md text-sm" />
                                </div>
                            </div>
                             <div className="flex gap-3">
                                <button onClick={handleApply} disabled={isProcessing} className="flex-1 bg-blue-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500">
                                    <Replace size={18} /> Aplicar
                                </button>
                                {processedImage && (
                                     <>
                                        <button onClick={() => onEdit(processedImage)} className="bg-gray-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={handleDownload} className="bg-blue-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                            <Download size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};
