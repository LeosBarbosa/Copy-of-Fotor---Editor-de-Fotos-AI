import { Wand2, Image, Scissors, Palette, Eraser, User, Camera, Zap } from 'lucide-react';

export const tools = {
    'ai-image-generator': { title: 'AI Generator', description: 'Generate images from text', icon: Wand2 },
    'ai-portrait': { title: 'AI Portrait', description: 'Turn photos into portraits', icon: User },
    'bg-remover': { title: 'BG Remover', description: 'Remove background instantly', icon: Scissors },
    'magic-eraser': { title: 'Magic Eraser', description: 'Remove unwanted objects', icon: Eraser },
    'ai-upscaler': { title: 'Upscaler', description: 'Enhance image resolution', icon: Zap },
    'colorize': { title: 'Colorize', description: 'Colorize black & white photos', icon: Palette },
    'one-tap-enhance': { title: 'Enhance', description: 'Auto-improve lighting & color', icon: Camera },
    // Add other tools as needed based on the App.tsx routes
};

export const TOOLS = tools; // export both for compatibility
