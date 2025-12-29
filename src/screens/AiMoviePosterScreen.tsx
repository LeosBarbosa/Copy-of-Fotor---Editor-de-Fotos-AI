import React from 'react';
import { SparkleIcon } from '../components/icons';

// Fix: Added props interface to match usage in App.tsx
interface AiMoviePosterScreenProps {
  onBack: () => void;
  onEdit: (imageUrl: string) => void;
}

const AiMoviePosterScreen: React.FC<AiMoviePosterScreenProps> = ({ onBack, onEdit }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center shadow-2xl max-w-md">
        <div className="flex justify-center mb-4">
             {/* Usando ícone disponível no projeto */}
            <SparkleIcon className="w-16 h-16 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Poster de Filme IA</h2>
        <p className="text-gray-400 mb-6">
          Funcionalidade pronta para implementação. Crie posters cinematográficos épicos a partir de suas fotos.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-bold"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default AiMoviePosterScreen;