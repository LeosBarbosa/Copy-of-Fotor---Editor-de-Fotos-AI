import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface StartScreenProps {
  onFileSelect: (file: File) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-800/50 hover:bg-gray-800/80 transition-all cursor-pointer w-full max-w-2xl"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleChange} 
        accept="image/*"
      />
      <div className="p-6 bg-gray-900 rounded-full mb-6">
        <Upload className="w-12 h-12 text-purple-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Upload an Image to Start</h2>
      <p className="text-gray-400">Drag & drop or click to browse</p>
    </div>
  );
};

export default StartScreen;
