import React, { useRef, useEffect } from 'react';
import { RotateCw, XCircle } from 'lucide-react';
import { CanvasElementData } from '../../types';

const getHandleStyles = (position: string) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        border: '1.5px solid white',
        backgroundColor: '#4f46e5',
        borderRadius: '2px',
        boxShadow: '0 0 3px rgba(0,0,0,0.5)',
        zIndex: 10,
    };
    switch (position) {
        case 'top-left': style.top = '-6px'; style.left = '-6px'; style.cursor = 'nwse-resize'; break;
        case 'top-center': style.top = '-6px'; style.left = '50%'; style.transform = 'translateX(-50%)'; style.cursor = 'ns-resize'; break;
        case 'top-right': style.top = '-6px'; style.right = '-6px'; style.cursor = 'nesw-resize'; break;
        case 'middle-left': style.top = '50%'; style.left = '-6px'; style.transform = 'translateY(-50%)'; style.cursor = 'ew-resize'; break;
        case 'middle-right': style.top = '50%'; style.right = '-6px'; style.transform = 'translateY(-50%)'; style.cursor = 'ew-resize'; break;
        case 'bottom-left': style.bottom = '-6px'; style.left = '-6px'; style.cursor = 'nesw-resize'; break;
        case 'bottom-center': style.bottom = '-6px'; style.left = '50%'; style.transform = 'translateX(-50%)'; style.cursor = 'ns-resize'; break;
        case 'bottom-right': style.bottom = '-6px'; style.right = '-6px'; style.cursor = 'nwse-resize'; break;
    }
    return style;
};

interface CanvasElementProps {
    element: CanvasElementData;
    onUpdate: (id: number, updates: Partial<CanvasElementData>) => void;
    onDelete: (id: number) => void;
    zoomLevel: number;
    isSelected: boolean;
    onSelect: () => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({ element, onUpdate, onDelete, zoomLevel, isSelected, onSelect }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (element.type === 'text' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [element.width, element.content, element.fontSize]);

    const handleInteraction = (e: React.MouseEvent, action: 'move' | 'resize' | 'rotate', cursorPosition?: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!elementRef.current) return;
        const startX = e.clientX;
        const startY = e.clientY;
        
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const initialElementState = { ...element };
        let hasInteracted = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
             const dx = (moveEvent.clientX - startX) / zoomLevel;
             const dy = (moveEvent.clientY - startY) / zoomLevel;

            if (!hasInteracted && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
                hasInteracted = true;
            }

            if (action === 'move') {
                onUpdate(element.id, { x: initialElementState.x + dx, y: initialElementState.y + dy });
            } else if (action === 'rotate') {
                const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
                onUpdate(element.id, { rotation: angle + 90 });
            } else if (action === 'resize' && cursorPosition) {
                 let newWidth = initialElementState.width;
                 let newHeight = initialElementState.height;
                 let newX = initialElementState.x;
                 let newY = initialElementState.y;

                 if (cursorPosition.includes('right')) newWidth += dx;
                 if (cursorPosition.includes('left')) { newWidth -= dx; newX += dx; }
                 if (cursorPosition.includes('bottom')) newHeight += dy;
                 if (cursorPosition.includes('top')) { newHeight -= dy; newY += dy; }
                
                 if (newWidth > 10 && newHeight > 10) {
                     onUpdate(element.id, { x: newX, y: newY, width: newWidth, height: newHeight });
                 }
            }
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (!hasInteracted) {
                onSelect();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(element.id, { content: e.target.value });
    };

    const renderContent = () => {
        if (element.type === 'text') {
            return (
                 <textarea
                    ref={textareaRef}
                    value={element.content}
                    onChange={handleTextChange}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full bg-transparent resize-none outline-none p-0 m-0 border-none"
                    style={{
                        fontFamily: element.fontFamily,
                        fontSize: element.fontSize,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        textAlign: element.textAlign,
                        lineHeight: 1.2,
                    }}
                />
            );
        }
        if (element.type === 'emoji') {
            return <div className="w-full h-full flex items-center justify-center text-5xl">{element.content}</div>;
        }
        return <div className={element.content} style={{width: '100%', height: '100%'}}></div>;
    };
    
    return (
        <div
            ref={elementRef}
            className={`absolute group ${isSelected ? 'border-2 border-solid border-blue-500' : ''}`}
            style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                transform: `rotate(${element.rotation}deg)`,
            }}
            onMouseDown={(e) => handleInteraction(e, 'move')}
        >
            {renderContent()}
            {isSelected && (
                <>
                    {/* Resize Handles */}
                    {['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                        <div key={pos} style={getHandleStyles(pos)} onMouseDown={(e) => handleInteraction(e, 'resize', pos)} />
                    ))}
                    {/* Rotate Handle */}
                    <div
                        style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', cursor: 'grab' }}
                        onMouseDown={(e) => handleInteraction(e, 'rotate')}
                    >
                        <RotateCw size={16} className="text-white bg-blue-500 rounded-full p-1" />
                    </div>
                    {/* Delete Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
                        className="absolute top-[-10px] right-[-10px] bg-red-500 text-white rounded-full p-0.5 z-10"
                        style={{ transform: 'translate(50%, -50%)' }}
                    >
                        <XCircle size={16} />
                    </button>
                </>
            )}
        </div>
    );
};
