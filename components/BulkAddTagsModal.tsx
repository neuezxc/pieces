import React, { useState, useCallback, useMemo, useRef } from 'react';
import { CloseIcon, TagIcon } from './icons';

interface BulkAddTagsModalProps {
  onClose: () => void;
  onSave: (tags: string[]) => void;
  allTags: string[];
}

const BulkAddTagsModal: React.FC<BulkAddTagsModalProps> = ({ onClose, onSave, allTags }) => {
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const filteredTagSuggestions = useMemo(() => {
    const availableTags = allTags.filter(tag => !currentTags.includes(tag));
    
    if (tagInput.trim() !== '') {
        return availableTags.filter(
            tag => tag.toLowerCase().includes(tagInput.toLowerCase())
        ).slice(0, 5);
    }
    
    if (isTagInputFocused) {
        return availableTags.slice(0, 10);
    }

    return [];
  }, [tagInput, allTags, currentTags, isTagInputFocused]);

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      setCurrentTags(prev => [...prev, trimmedTag]);
    }
    setTagInput('');
  }, [currentTags]);

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '') {
        e.preventDefault();
        removeTag(currentTags[currentTags.length - 1]);
    }
  };
  
  const handleSave = () => {
    if (currentTags.length > 0) {
        onSave(currentTags);
    } else {
        onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-content">Add Tags to Selected Items</h2>
          <button onClick={onClose} className="text-surface-content hover:text-content transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
            <label htmlFor="tags" className="block text-sm font-medium text-surface-content mb-2">Tags to Add</label>
            <div className="relative">
                <div 
                    className="w-full bg-background border border-white/10 rounded-md px-3 py-2 flex flex-wrap items-center gap-2 cursor-text"
                    onClick={() => tagInputRef.current?.focus()}
                >
                    {currentTags.map(tag => (
                        <span key={tag} className="flex items-center bg-primary/20 text-content rounded-md px-2 py-1 text-xs font-medium">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 -mr-0.5 text-surface-content hover:text-content">
                                <CloseIcon className="w-3 h-3"/>
                            </button>
                        </span>
                    ))}
                    <input
                      ref={tagInputRef}
                      type="text" id="tags" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onFocus={() => setIsTagInputFocused(true)}
                      onBlur={() => setIsTagInputFocused(false)}
                      className="bg-transparent focus:outline-none flex-grow min-w-[80px] text-sm"
                      placeholder={currentTags.length === 0 ? "Add tags..." : ""}
                    />
                </div>
                {filteredTagSuggestions.length > 0 && (
                    <div 
                        className="absolute z-10 w-full mt-1 bg-surface border border-white/10 rounded-md shadow-lg"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <div className="p-2 text-xs text-surface-content">
                            {tagInput.trim() === '' ? 'Existing Tags' : 'Suggestions'}
                        </div>
                        <ul className="py-1 max-h-40 overflow-y-auto">
                            {filteredTagSuggestions.map(tag => (
                                <li key={tag} className="px-3 py-2 text-sm hover:bg-primary/20 cursor-pointer" onClick={() => addTag(tag)}>
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>

        <div className="p-5 border-t border-white/10 mt-auto flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10 text-sm">
                Cancel
            </button>
            <button
                onClick={handleSave}
                disabled={currentTags.length === 0}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                <TagIcon className="w-4 h-4" />
                <span>Add Tags</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAddTagsModal;