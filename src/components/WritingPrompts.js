import React, { useState, useEffect } from 'react';
import { WRITING_PROMPTS } from '../data/writingPrompts';

export const WritingPrompts = ({ selectedGenre, onPromptSelect, className = "" }) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);

  const getRandomPrompt = (genre = 'general') => {
    const prompts = WRITING_PROMPTS[genre] || WRITING_PROMPTS.general;
    const availablePrompts = prompts.filter(p => !promptHistory.includes(p));
    
    if (availablePrompts.length === 0) {
      setPromptHistory([]);
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
    
    return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
  };

  const generateNewPrompt = () => {
    const prompt = getRandomPrompt(selectedGenre);
    setCurrentPrompt(prompt);
    setPromptHistory(prev => [...prev, prompt].slice(-5)); // Keep last 5
    if (onPromptSelect) onPromptSelect(prompt);
  };

  useEffect(() => {
    generateNewPrompt();
  }, [selectedGenre]);

  return (
    <div className={`bg-fantasy-700 p-4 rounded-lg border border-fantasy-600 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-fantasy-200">Writing Prompt</h4>
        <button
          onClick={generateNewPrompt}
          className="bg-fantasy-600 hover:bg-fantasy-500 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          New Prompt
        </button>
      </div>
      
      <div className="bg-fantasy-600 p-4 rounded-lg mb-3">
        <p className="text-fantasy-100 italic leading-relaxed">
          "{currentPrompt}"
        </p>
      </div>
      
      <div className="text-xs text-fantasy-400">
        Genre: <span className="capitalize text-fantasy-300">{selectedGenre}</span>
      </div>
    </div>
  );
};
