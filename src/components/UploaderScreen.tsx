import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomUploadIcon = () => (
    <div className="relative w-16 h-16 mb-4">
      <svg className="absolute top-0 left-0" width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5 19H19.5C20.3284 19 21 18.3284 21 17.5V7.5C21 6.67157 20.3284 6 19.5 6H9.5C8.67157 6 8 6.67157 8 7.5V10.5" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 14.5H15.5C16.3284 14.5 17 13.8284 17 13V4.5C17 3.67157 16.3284 3 15.5 3H3.5C2.67157 3 2 3.67157 2 4.5V13C2 13.8284 2.67157 14.5 3.5 14.5Z" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white border-4 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
      </div>
    </div>
);

const CarregarImagemIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.25 15.75V3.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.25 11.75L12.25 15.75L8.25 11.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.75 14.75V18.25C3.75 19.3546 4.64543 20.25 5.75 20.25H18.75C19.8546 20.25 20.75 19.3546 20.75 18.25V14.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface UploaderScreenProps {
  onImageSelect: (url: string) => void;
}

export const UploaderScreen: React.FC<UploaderScreenProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };
  
  const sampleImages = [
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=128&h=128&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&q=80'
  ];

  return (
    <main className="flex-1 flex items-center justify-center p-8 bg-[#f0f2f5] overflow-auto">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="w-full max-w-4xl text-center p-10">
        <div className="border-2 border-dashed border-gray-300 rounded-xl py-16 px-10">
          <div className="flex justify-center items-center">
            <CustomUploadIcon />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Arraste ou carregue suas próprias imagens</h2>
          <div className="flex justify-center my-4">
            <div className="inline-flex rounded-full shadow-lg">
              <button onClick={handleUploadClick} className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold py-3 px-8 rounded-l-full transition-transform hover:scale-105 flex items-center gap-3">
                <CarregarImagemIcon />
                Carregar imagem
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-4 rounded-r-full transition-transform hover:scale-105 flex items-center">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-4">Nenhuma foto? Experimente um dos nossos.</p>
          <div className="flex justify-center gap-2">
            {sampleImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Exemplo ${i + 1}`}
                onClick={() => onImageSelect(src)}
                className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};