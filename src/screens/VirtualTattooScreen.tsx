
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Wand, Edit, Brush, X } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { imageUrlToBase64 } from '../utils/fileUtils';
import { AI_IMAGE_MODEL } from '../config/constants';

// CanvasEditor Component
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
            if (imgRatio > containerRatio) {
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
             <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair max-w-full max-h-full object-contain"
            />
             <canvas ref={maskCanvasRef} className="hidden" />
        </div>
    );
};

// Main Screen Component
export const VirtualTattooScreen: React.FC<{ onBack: () => void; onEdit: (imageUrl: string) => void; }> = ({ onBack, onEdit }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const [tattooImage, setTattooImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [brushSize, setBrushSize] = useState(40);
    const bodyPhotoInputRef = useRef<HTMLInputElement>(null);
    const tattooImageInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!originalImage || !maskImage || (!prompt.trim() && !tattooImage)) {
            setError('Carregue uma foto, pinte a área e descreva ou carregue um modelo de tatuagem.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        setProcessedImage(null);

        try {
            const { base64: bodyBase64, mimeType: bodyMimeType } = await imageUrlToBase64(originalImage);
            const { base64: maskBase64, mimeType: maskMimeType } = await imageUrlToBase64(maskImage);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const parts: any[] = [
                { inlineData: { data: bodyBase64, mimeType: bodyMimeType } },
                { inlineData: { data: maskBase64, mimeType: maskMimeType } },
            ];
    
            let fullPrompt = `Use a segunda imagem como uma máscara. Na primeira imagem (a foto do corpo), aplique uma tatuagem na área branca da máscara.`;
            
            if (tattooImage) {
                const { base64: tattooBase64, mimeType: tattooMimeType } = await imageUrlToBase64(tattooImage);
                parts.push({ inlineData: { data: tattooBase64, mimeType: tattooMimeType } });
                fullPrompt += ` Use a terceira imagem (o modelo da tatuagem) como a referência principal para o design da tatuagem.`;
            }
    
            if (prompt.trim()) {
                fullPrompt += ` Use a seguinte descrição para guiar o estilo e os detalhes: "${prompt}".`;
            }
    
            fullPrompt += ` Faça a tatuagem seguir realisticamente os contornos do corpo, ajustando a iluminação, as sombras e a perspectiva. Não altere a pessoa ou o fundo fora da área mascarada.`;
            
            parts.push({ text: fullPrompt });


            const response = await ai.models.generateContent({
              model: AI_IMAGE_MODEL,
              contents: { parts },
              config: { responseModalities: [Modality.IMAGE] },
            });
            
            const candidate = response.candidates?.[0];
            const partsRes = candidate?.content?.parts || [];
            let newImageFound = false;
            
            for (const part of partsRes) {
                if (part.inlineData) {
                    setProcessedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    newImageFound = true;
                    break;
                }
            }
            if (!newImageFound) {
                const text = candidate?.content?.parts?.[0]?.text;
                if (text) throw new Error(`Falha: ${text}`);
                throw new Error("A IA não retornou uma imagem.");
            }
        } catch (err: any) {
            console.error("Erro na tatuagem virtual:", err);
            setError(err.message || "Falha ao gerar a tatuagem.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBodyPhotoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setOriginalImage(e.target?.result as string);
            setProcessedImage(null);
            setMaskImage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleBodyPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleBodyPhotoUpload(e.target.files[0]);
    };

    const handleTattooImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setTattooImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleTattooImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleTattooImageUpload(e.target.files[0]);
    };

    const handleDownload = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `tatuagem-ia-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-screen bg-[#1F1F1F] text-white overflow-hidden">
            <style>{`.bg-checkered { background-color: #444; background-image: linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }`}</style>
            <input type="file" ref={bodyPhotoInputRef} onChange={handleBodyPhotoFileChange} className="hidden" accept="image/*" />
            <input type="file" ref={tattooImageInputRef} onChange={handleTattooImageFileChange} className="hidden" accept="image/*" />
            
            <div className="relative flex-1 overflow-hidden">
                <main className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                            <svg className="w-16 h-16 animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-white font-semibold text-lg">Aplicando sua tatuagem...</h3>
                            <p className="text-gray-300 text-sm mt-1">A IA está desenhando em sua pele.</p>
                        </div>
                    ) : processedImage ? (
                         <div className="w-full h-full flex items-center justify-center p-4"><img src={processedImage} alt="Resultado" className="max-w-full max-h-full object-contain rounded-lg"/></div>
                    ) : originalImage ? (
                        <CanvasEditor image={originalImage} brushSize={brushSize} onMaskChange={setMaskImage} />
                    ) : (
                        <div className="text-center max-w-2xl p-4">
                           <Wand size={48} className="mx-auto text-blue-400 mb-4"/>
                            <h2 className="text-3xl font-bold mb-2">Provador Virtual de Tatuagens</h2>
                            <p className="text-gray-400 mb-6">Pinte onde você quer sua tatuagem e descreva-a para a IA.</p>
                            <button onClick={() => bodyPhotoInputRef.current?.click()} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-blue-700 mx-auto">
                                <Upload size={20} /> Carregar Foto do Corpo
                            </button>
                        </div>
                    )}
                </main>
                
                <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-semibold text-lg drop-shadow-md">Provador Virtual de Tatuagens IA</h1>
                    </div>
                </header>

                <footer className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    {error && <div className="max-w-xl mx-auto mb-2 p-2 bg-red-900/80 rounded-lg text-center text-sm text-red-300 backdrop-blur-sm">{error}</div>}
                    {originalImage && (
                        <div className="max-w-xl mx-auto flex flex-col gap-4 bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            <div className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <label className="text-sm text-gray-300">Tamanho do Pincel: {brushSize}px</label>
                                        <input type="range" min="10" max="150" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full mt-1" />
                                    </div>
                                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva a tatuagem..." className="w-full h-20 bg-gray-700/50 p-2 rounded-md text-sm resize-none placeholder-gray-500" />
                                </div>
                                <div className="w-32 flex-shrink-0">
                                    <label className="text-sm text-gray-300">Modelo (Opcional)</label>
                                    <div onClick={() => tattooImageInputRef.current?.click()} className="mt-1 w-full h-24 bg-gray-700/50 rounded-md flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-500 relative">
                                        {tattooImage ? (
                                            <>
                                                <img src={tattooImage} alt="Tattoo Design" className="max-w-full max-h-full object-contain p-1" />
                                                <button onClick={(e) => { e.stopPropagation(); setTattooImage(null); }} className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-full text-white"><X size={14} /></button>
                                            </>
                                        ) : (
                                            <div className="text-center text-gray-500"><Upload size={20} /><p className="text-[10px] mt-1">Carregar</p></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {processedImage ? (
                                    <>
                                        <button onClick={() => onEdit(processedImage)} className="flex-1 bg-gray-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Edit size={18} /> Editar</button>
                                        <button onClick={handleDownload} className="flex-1 bg-blue-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Download size={18} /> Baixar</button>
                                    </>
                                ): (
                                    <button onClick={handleGenerate} disabled={isProcessing || !maskImage || (!prompt.trim() && !tattooImage)} className="w-full bg-blue-600 font-bold py-3 rounded-lg disabled:bg-gray-500">
                                        {isProcessing ? 'Gerando...' : 'Gerar Tatuagem'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};
