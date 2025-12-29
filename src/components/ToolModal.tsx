import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToolModalProps {
  title: string;
  children: React.ReactNode;
}

const ToolModal: React.FC<ToolModalProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold pl-2">{title}</h2>
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
