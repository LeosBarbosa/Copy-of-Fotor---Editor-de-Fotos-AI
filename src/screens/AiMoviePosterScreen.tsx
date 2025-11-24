import React from 'react';
// CORREÇÃO: Importando do arquivo de ícones local existente
import { SparkleIcon } from '../components/icons';

const AiMoviePosterScreen: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center shadow-2xl max-w-md">
        <div className="flex justify-center mb-4">
             {/* Usando ícone disponível no projeto */}
            <SparkleIcon className="w-16 h-16 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Poster de Filme IA</h2>
        <p className="text-gray-400">
          Funcionalidade pronta para implementação.
        </p>
      </div>
    </div>
  );
};

export default AiMoviePosterScreen;