import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, FolderIcon } from './icons';

interface SaveCollectionModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  itemCount: number;
}

const SaveCollectionModal: React.FC<SaveCollectionModalProps> = ({ onClose, onSave, itemCount }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-content">Save as Collection</h2>
          <button type="button" onClick={onClose} className="text-surface-content hover:text-content transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
            <label htmlFor="collection-name" className="block text-sm font-medium text-surface-content mb-2">Collection Name</label>
            <input
                ref={inputRef}
                type="text"
                id="collection-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sci-Fi Characters, Fantasy Landscapes"
                className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-content focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
            />
            <p className="text-xs text-surface-content mt-2">This collection will contain {itemCount} item{itemCount !== 1 ? 's' : ''}.</p>
        </div>

        <div className="p-5 border-t border-white/10 mt-auto flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10 text-sm">
                Cancel
            </button>
            <button
                type="submit"
                disabled={!name.trim()}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                <FolderIcon className="w-4 h-4" />
                <span>Save Collection</span>
            </button>
        </div>
      </form>
    </div>
  );
};

export default SaveCollectionModal;
