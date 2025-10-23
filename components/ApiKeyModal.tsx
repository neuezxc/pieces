import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface ApiKeyModalProps {
  initialKey?: string;
  onSave: (apiKey: string) => void;
  onClose: () => void;
  errorMessage?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ initialKey, onSave, onClose, errorMessage }) => {
  const [key, setKey] = useState(initialKey || '');

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-content">Gemini API Key</h2>
          <button onClick={onClose} className="text-surface-content hover:text-content transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-surface-content mb-4">
            To use AI features, you need a Google Gemini API key. You can get a free key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Google AI Studio
            </a>.
          </p>
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md p-3 mb-4">
              {errorMessage}
            </div>
          )}
          <label htmlFor="api-key" className="block text-sm font-medium text-surface-content mb-1">Your API Key</label>
          <input
            type="password"
            id="api-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-content focus:ring-2 focus:ring-primary focus:border-primary transition"
            placeholder="Enter your key here"
          />
        </div>
        <div className="p-5 border-t border-white/10 mt-auto flex justify-end items-center gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
