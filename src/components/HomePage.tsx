
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tools } from '../config/tools';
import { SparkleIcon } from './icons';

// Fix: Defined Tool interface to ensure type safety for configuration objects
interface Tool {
  title: string;
  description: string;
  icon?: React.ElementType;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // Fix: Cast tools to Record<string, Tool> to avoid 'unknown' type errors during property access
  const toolsMap = tools as Record<string, Tool>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
        <SparkleIcon className="w-10 h-10 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        Editor de Fotos IA
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Fix: Explicitly cast entries and iteration item to Tool type to resolve property access errors on lines 24-28 */}
        {(Object.entries(toolsMap || {}) as [string, Tool][]).map(([id, tool]) => {
          // Fix: Extract icon and capitalize to use as a valid React component tag
          const ToolIcon = tool.icon;
          return (
            <button
              key={id}
              onClick={() => navigate(`/tool/${id}`)}
              className="group p-6 bg-[#1a1c20] rounded-2xl hover:bg-[#2a2d33] transition-all flex flex-col items-center gap-5 border border-gray-800 hover:border-blue-500/50 shadow-xl"
            >
              <div className="p-5 bg-[#111317] rounded-full group-hover:scale-110 transition-transform">
                {ToolIcon ? (
                    <ToolIcon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                ) : (
                    <SparkleIcon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                )}
              </div>
              <div className="text-center">
                {/* Fix: Access title and description properties after proper type casting */}
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{tool.description}</p>
              </div>
            </button>
          );
        })}
        {(!toolsMap || Object.keys(toolsMap).length === 0) && (
            <div className="col-span-full py-20 text-center">
                <p className="text-gray-600 font-medium italic">Nenhuma ferramenta de IA configurada. Verifique src/config/tools.ts</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
