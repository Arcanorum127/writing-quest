import React, { useState, useEffect, useRef } from 'react';

export const DistractionFreeMode = ({ onSave, onExit, initialText = '', prompt = '' }) => {
  const [text, setText] = useState(initialText);
  const [wordCount, setWordCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showInterface, setShowInterface] = useState(true);
  const textareaRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const autoSaveRef = useRef(null);

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    
    // Auto-save every 30 seconds
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (onSave && text.trim()) {
        onSave(text, wordCount);
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [text, wordCount, onSave]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowInterface(!showInterface);
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave(text, wordCount);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showInterface, onSave, text, wordCount]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExit = () => {
    if (onSave) onSave(text, wordCount);
    if (onExit) onExit();
  };

  return (
    <div className="fixed inset-0 bg-fantasy-900 z-50 flex flex-col">
      {/* Floating Interface */}
      <div className={`absolute top-4 right-4 z-10 transition-opacity duration-300 ${
        showInterface ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="bg-fantasy-800 border border-fantasy-600 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-sm">
              <span className="text-fantasy-400">Words:</span>
              <span className="text-fantasy-200 font-bold ml-1">{wordCount}</span>
            </div>
            <div className="text-sm">
              <span className="text-fantasy-400">Time:</span>
              <span className="text-fantasy-200 font-bold ml-1">{formatTime(sessionTime)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSaveAndExit}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Save & Exit
            </button>
            <button
              onClick={onExit}
              className="bg-fantasy-600 hover:bg-fantasy-500 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Exit
            </button>
          </div>
          
          <div className="text-xs text-fantasy-400 mt-2">
            Press ESC to toggle interface • Ctrl+S to save
          </div>
        </div>
      </div>

      {/* Prompt Display */}
      {prompt && showInterface && (
        <div className="absolute top-4 left-4 max-w-md">
          <div className="bg-fantasy-800 border border-fantasy-600 rounded-lg p-4 shadow-lg">
            <h4 className="text-sm font-bold text-fantasy-300 mb-2">Writing Prompt</h4>
            <p className="text-sm text-fantasy-200 italic">"{prompt}"</p>
          </div>
        </div>
      )}

      {/* Main Writing Area */}
      <div className="flex-1 p-8 flex items-center justify-center">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full max-w-4xl h-full bg-transparent text-fantasy-100 text-lg leading-relaxed resize-none outline-none placeholder-fantasy-500"
          placeholder="Start writing... (Press ESC to toggle interface)"
          style={{ 
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8'
          }}
        />
      </div>
    </div>
  );
};
