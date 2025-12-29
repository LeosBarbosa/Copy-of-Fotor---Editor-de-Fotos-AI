import React from 'react';
import { X } from 'lucide-react';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    beforeImage: string;
    afterImage: string;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, beforeImage, afterImage }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full">
                <X className="w-6 h-6" />
            </button>
            <div className="flex gap-4 h-[80vh]">
                <div className="flex-1 flex flex-col">
                    <span className="text-center mb-2 font-semibold">Before</span>
                    <img src={beforeImage} alt="Before" className="flex-1 object-contain bg-gray-900 rounded" />
                </div>
                <div className="flex-1 flex flex-col">
                    <span className="text-center mb-2 font-semibold">After</span>
                    <img src={afterImage} alt="After" className="flex-1 object-contain bg-gray-900 rounded" />
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
