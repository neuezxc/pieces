import React, { useState, useMemo } from 'react';
import type { ImageEntry, ImageLibrary } from '../types';
import ImageCard from './ImageCard';
import InspirationModal from './InspirationModal';
import { CopyIcon, CheckIcon, CloseIcon, LightbulbIcon, FilterIcon } from './icons';

interface BuilderViewProps {
  library: ImageLibrary;
  selectedComponents: ImageEntry[];
  setSelectedComponents: React.Dispatch<React.SetStateAction<ImageEntry[]>>;
}

const BuilderView: React.FC<BuilderViewProps> = ({ library, selectedComponents, setSelectedComponents }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    library.forEach(entry => entry.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [library]);

  const filteredLibrary = useMemo(() => {
    if (!selectedTag) {
      return library;
    }
    return library.filter(entry => entry.tags.includes(selectedTag));
  }, [library, selectedTag]);

  const handleComponentClick = (entry: ImageEntry) => {
    setSelectedComponents(prev => {
      const isSelected = prev.some(item => item.id === entry.id);
      if (isSelected) {
        return prev.filter(item => item.id !== entry.id);
      } else {
        return [...prev, entry];
      }
    });
  };

  const finalPrompt = useMemo(() => {
    return selectedComponents.map(c => c.prompt).join(', ');
  }, [selectedComponents]);

  const handleCopy = () => {
    if (finalPrompt) {
      navigator.clipboard.writeText(finalPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleGenerateInspiration = (tags: string[]) => {
    if (tags.length === 0) return;
    const entriesByTag = new Map<string, ImageEntry[]>();
    library.forEach(entry => {
        entry.tags.forEach(tag => {
            if (tags.includes(tag)) {
                 if (!entriesByTag.has(tag)) entriesByTag.set(tag, []);
                entriesByTag.get(tag)?.push(entry);
            }
        });
    });
    const randomSelection = tags.map(tag => {
        const possibleEntries = entriesByTag.get(tag);
        if (!possibleEntries || possibleEntries.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * possibleEntries.length);
        return possibleEntries[randomIndex];
    }).filter((entry): entry is ImageEntry => entry !== null);
    const uniqueSelection = Array.from(new Map(randomSelection.map(item => [item.id, item])).values());
    setSelectedComponents(uniqueSelection);
  };

  if (library.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-12rem)]">
            <h2 className="text-xl font-bold text-content">The Builder is waiting.</h2>
            <p className="text-surface-content mt-2">Add components to your Library to start building prompts.</p>
        </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100vh-4rem)] flex flex-col relative animate-fade-in">
        {/* Top bar: Filters & Inspire */}
        <div className="flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-white/10 p-3 flex items-center space-x-2 z-20">
            <button
                onClick={() => setIsInspireModalOpen(true)}
                disabled={allTags.length === 0}
                className="flex items-center space-x-2 px-3 py-1.5 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                title={allTags.length === 0 ? "Add tagged components to use Inspiration Mode" : "Generate a random prompt"}
            >
                <LightbulbIcon className="w-4 h-4" />
                <span>Inspire</span>
            </button>
            <div className="h-5 w-px bg-white/10"></div>
             <FilterIcon className="w-5 h-5 text-surface-content" />
            <div className="flex-grow overflow-x-auto">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setSelectedTag(null)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!selectedTag ? 'bg-primary text-white' : 'bg-surface hover:bg-white/5 text-content'}`}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => setSelectedTag(tag)}
                             className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-primary text-white' : 'bg-surface hover:bg-white/5 text-content'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Center Panel: Gallery */}
        <main className="flex-grow p-6 overflow-y-auto pb-48">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-6">
            {filteredLibrary.map(entry => {
              const isSelected = selectedComponents.some(c => c.id === entry.id);
              return <ImageCard key={entry.id} entry={entry} onClick={() => handleComponentClick(entry)} isSelected={isSelected} />;
            })}
          </div>
        </main>

        {/* Bottom Panel: Builder Shelf */}
        {selectedComponents.length > 0 && (
            <aside className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-lg border-t border-white/10 p-4 shadow-2xl animate-slide-up">
                <div className="container mx-auto flex items-start gap-6">
                    {/* Mood Board */}
                    <div className="flex-shrink-0 pt-1">
                        <div className="flex items-center gap-2">
                            {selectedComponents.slice(0, 10).map(comp => (
                                <div key={comp.id} className="relative group w-12 h-12">
                                    <img src={comp.imageData} alt={comp.title} className="w-full h-full object-cover rounded-md"/>
                                    <button onClick={() => handleComponentClick(comp)} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                                        <CloseIcon className="w-3.5 h-3.5 text-white"/>
                                    </button>
                                </div>
                            ))}
                            {selectedComponents.length > 10 && <div className="w-12 h-12 bg-background rounded-md flex items-center justify-center text-sm font-bold text-surface-content">+{selectedComponents.length - 10}</div>}
                        </div>
                    </div>

                    {/* Live Prompt */}
                    <div className="flex-grow min-w-0">
                         <p className="text-xs font-semibold text-surface-content uppercase tracking-wider mb-1">Live Prompt ({selectedComponents.length} items)</p>
                        <p className="text-sm text-content whitespace-normal break-words max-h-24 overflow-y-auto pr-2">{finalPrompt || "Your combined prompt will appear here..."}</p>
                    </div>

                    {/* Copy Button */}
                    <div className="flex-shrink-0 pt-1">
                        <button
                            onClick={handleCopy}
                            className="flex items-center space-x-2.5 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-all disabled:opacity-40"
                            disabled={!finalPrompt}
                            aria-label="Copy prompt"
                        >
                            {isCopied ? <CheckIcon className="w-5 h-5"/> : <CopyIcon className="w-5 h-5"/>}
                            <span className="text-sm">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
            </aside>
        )}
      </div>

      <InspirationModal
        isOpen={isInspireModalOpen}
        onClose={() => setIsInspireModalOpen(false)}
        allTags={allTags}
        onGenerate={handleGenerateInspiration}
      />
    </>
  );
};

export default BuilderView;