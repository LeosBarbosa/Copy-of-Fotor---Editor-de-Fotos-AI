import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tools } from '../config/tools'; // Ensure this exists, or I will mock it
import { SparkleIcon } from './icons'; // Ensure this exists

// Define an interface for the tool objects to fix 'unknown' type errors
interface Tool {
  title: string;
  description: string;
  icon?: React.ElementType;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SparkleIcon className="w-8 h-8 text-purple-500" />
        AI Photo Editor
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Helper to map tools if they exist, or show placeholders */}
        {/* Fix: Added type casting and capitalized variable for the component to fix 'unknown' property access and JSX tag errors */}
        {Object.entries(tools || {}).map(([id, t]) => {
          const tool = t as Tool;
          const ToolIcon = tool.icon;
          return (
            <button
              key={id}
              onClick={() => navigate(`/tool/${id}`)}
              className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all flex flex-col items-center gap-4 border border-gray-700 hover:border-purple-500/50"
            >
              <div className="p-4 bg-gray-900 rounded-full">
                {ToolIcon ? <ToolIcon className="w-8 h-8 text-purple-400" /> : <SparkleIcon className="w-8 h-8 text-purple-400" />}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{tool.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
              </div>
            </button>
          );
        })}
        {(!tools || Object.keys(tools).length === 0) && (
            <p className="text-gray-400">No tools configuration found. Please check src/config/tools.ts</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;