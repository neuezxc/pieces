import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { ImageEntry } from '../types';
import { CloseIcon, SparklesIcon } from './icons';

interface AddImageModalProps {
  imageData: string | null;
  entryToEdit?: ImageEntry | null;
  onClose: () => void;
  onSave: (entry: Omit<ImageEntry, 'dateAdded'>, isEdit: boolean) => void;
  allTags: string[];
  apiKey: string;
  onInvalidApiKey: () => void;
  openApiKeyModal: () => void;
}

const AddImageModal: React.FC<AddImageModalProps> = ({ imageData, entryToEdit, onClose, onSave, allTags, apiKey, onInvalidApiKey, openApiKeyModal }) => {
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [notes, setNotes] = useState(entryToEdit?.notes || '');
  const [promptText, setPromptText] = useState(entryToEdit?.prompt || '');
  const [currentTags, setCurrentTags] = useState<string[]>(entryToEdit?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isTagInputFocused, setIsTagInputFocused] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFocus, setGenerationFocus] = useState('');
  
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const imageSource = entryToEdit?.imageData || imageData;
  const isEditMode = !!entryToEdit;

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


  const generatePrompt = useCallback(async () => {
    if (!imageSource) return;
    if (!apiKey) {
      openApiKeyModal();
      return;
    }
    
    setIsGenerating(true);
    setPromptText('');

    try {
      const ai = new GoogleGenAI({ apiKey });
      const dataUrlToParts = (dataUrl: string) => {
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) throw new Error('Invalid data URL');
        return { mimeType: match[1], data: match[2] };
      };

      const imagePart = { inlineData: dataUrlToParts(imageSource) };
      const textInstruction = generationFocus
        ? `Describe only the ${generationFocus} in this image for an AI art prompt. Be concise and specific.`
        : 'Describe this image for an AI art prompt. Focus on the main subject, style, and composition. Be concise and descriptive.';
      const textPart = { text: textInstruction };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });
      
      setPromptText(response.text.trim());
    } catch (error) {
      console.error("Error generating prompt:", error);
      if (error instanceof Error && (error.message.includes('API key not valid') || error.message.toLowerCase().includes('permission denied'))) {
        onInvalidApiKey();
      } else {
        setPromptText("Could not generate prompt. Please check the console for details.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [imageSource, generationFocus, apiKey, openApiKeyModal, onInvalidApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim() || !imageSource) {
      alert('Title, Prompt, and an image are required.');
      return;
    }
    
    const saveData = {
        id: entryToEdit?.id || `id_${Date.now()}`,
        imageData: imageSource,
        title,
        notes,
        prompt: promptText,
        tags: currentTags
    };
    onSave(saveData, isEditMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 text-surface-content hover:text-content transition-colors z-10">
          <CloseIcon className="w-6 h-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-2xl font-bold mb-8 text-content">{isEditMode ? 'Edit Image' : 'Add New Image'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-center bg-background/50 rounded-lg p-2">
              <img src={imageSource} alt="Pasted content" className="rounded-md object-contain w-full max-h-[60vh]" />
            </div>
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-surface-content mb-1">Title</label>
                <input
                  type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-content focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-surface-content mb-1">Prompt</label>
                 <div className="flex items-center space-x-2 mb-2">
                    <input
                        type="text" value={generationFocus} onChange={(e) => setGenerationFocus(e.target.value)}
                        placeholder="Focus (e.g., hairstyle, pose)"
                        className="flex-grow bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-content focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
                        disabled={isGenerating}
                    />
                    <button 
                        type="button" onClick={generatePrompt} disabled={isGenerating}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary/80 hover:bg-primary/100 rounded-md text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Generate prompt from image"
                    >
                        <SparklesIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>{isGenerating ? 'Analyzing...' : 'Autofill'}</span>
                    </button>
                </div>
                <textarea
                  id="prompt" value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={4}
                  className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-content focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
                  placeholder="Enter prompt manually or use AI autofill..."
                  required disabled={isGenerating}
                />
              </div>
              <div className="relative">
                <label htmlFor="tags" className="block text-sm font-medium text-surface-content mb-1">Tags</label>
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
                      placeholder={currentTags.length === 0 ? "Add tags (,) or (enter)..." : ""}
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
               <div>
                <label htmlFor="notes" className="block text-sm font-medium text-surface-content mb-1">Notes (Optional)</label>
                <textarea
                  id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-content focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <p className="text-xs text-surface-content/80 mt-1.5">Markdown supported for formatting.</p>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface hover:bg-white/5 rounded-lg text-content font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors">Save</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddImageModal;
