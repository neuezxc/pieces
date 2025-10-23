import React from 'react';
import { View } from '../types';
import { KeyIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  onApiKeyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, onApiKeyClick }) => {
  const getButtonClasses = (view: View) => `
    px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
    ${currentView === view ? 'bg-primary text-white' : 'text-surface-content hover:text-content hover:bg-surface'}
  `;

  return (
    <header className="bg-background/80 backdrop-blur-lg sticky top-0 z-40 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-content">
              PromptForge
            </h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-1 bg-surface p-1 rounded-lg">
                <button
                onClick={() => setView(View.LIBRARY)}
                className={getButtonClasses(View.LIBRARY)}
                >
                Library
                </button>
                <button
                onClick={() => setView(View.BUILDER)}
                className={getButtonClasses(View.BUILDER)}
                >
                Builder
                </button>
                <button
                onClick={() => setView(View.COLLECTIONS)}
                className={getButtonClasses(View.COLLECTIONS)}
                >
                Collections
                </button>
            </div>
            <div className="h-8 w-px bg-white/10 mx-4"></div>
            <button 
                onClick={onApiKeyClick} 
                className="p-2 text-surface-content hover:text-content hover:bg-surface rounded-full transition-colors" 
                aria-label="Set API Key"
                title="Manage Gemini API Key"
            >
              <KeyIcon className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
