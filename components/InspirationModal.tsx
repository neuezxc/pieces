import React, { useState, useEffect } from 'react';
import { CloseIcon, LightbulbIcon } from './icons';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  onGenerate: (selectedTags: string[]) => void;
}

const InspirationModal: React.FC<InspirationModalProps> = ({ isOpen, onClose, allTags, onGenerate }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
    }
  }, [isOpen]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerateClick = () => {
    onGenerate(selectedTags);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-content">Create Inspiration</h2>
          <button onClick={onClose} className="text-surface-content hover:text-content transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-surface-content text-sm mb-5">Select categories to combine for a random prompt.</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {allTags.map(tag => (
              <label key={tag} htmlFor={`inspire-${tag}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  id={`inspire-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="h-4 w-4 rounded bg-background border-white/20 text-primary focus:ring-primary focus:ring-offset-surface"
                />
                <span className="text-content font-medium select-none text-sm">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-white/10 mt-auto">
          <button
            onClick={handleGenerateClick}
            disabled={selectedTags.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LightbulbIcon className="w-5 h-5" />
            <span className="text-sm">Generate Inspiration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationModal;