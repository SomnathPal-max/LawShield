import React, { useState, useEffect } from 'react';
import { EyeOff } from 'lucide-react';

export const DecoyMode = () => {
  const [isDecoyActive, setIsDecoyActive] = useState(false);
  const [escapeCount, setEscapeCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEscapeCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            setIsDecoyActive(true);
            return 0;
          }
          return newCount;
        });
        
        // Reset count after 1 second if they don't double tap
        setTimeout(() => setEscapeCount(0), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isDecoyActive) {
    return (
      <button
        onClick={() => setIsDecoyActive(true)}
        className="fixed bottom-6 left-6 z-[9999] p-3 bg-stone-200/50 hover:bg-stone-300/80 text-stone-500 rounded-full backdrop-blur-md transition-all opacity-50 hover:opacity-100"
        title="Double-tap ESC or click for Quick Exit (Stealth Mode)"
      >
        <EyeOff size={18} />
      </button>
    );
  }

  // Decoy UI: A fake, benign Google search page or Wikipedia iframe
  return (
    <div className="fixed inset-0 z-[100000] bg-white w-full h-full overflow-hidden flex flex-col">
      {/* Fake Browser Header to look completely innocent */}
      <div className="w-full bg-[#f1f3f4] h-14 border-b border-gray-300 flex items-center px-4 space-x-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white h-8 rounded-full border border-gray-200 px-4 flex items-center text-sm text-gray-500 font-sans">
          https://www.google.com/search?q=easy+dinner+recipes
        </div>
      </div>
      
      {/* We embed Wikipedia or a generic site. Using a generic unblockable site like Wikipedia */}
      <iframe 
        src="https://en.wikipedia.org/wiki/Main_Page" 
        className="w-full flex-1 border-none"
        title="Decoy Content"
      />
      
      {/* Secret way to exit Decoy Mode: Triple tap Escape */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 opacity-0 cursor-default"
        onDoubleClick={() => setIsDecoyActive(false)}
        title="Double click hidden corner to restore"
      />
    </div>
  );
};
