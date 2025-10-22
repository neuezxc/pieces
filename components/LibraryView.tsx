import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ImageEntry, ImageLibrary } from '../types';
import ImageCard from './ImageCard';
import BulkAddTagsModal from './BulkAddTagsModal';
import SaveCollectionModal from './SaveCollectionModal';
import { SearchIcon, FilterIcon, CloseIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons';

interface LibraryViewProps {
  library: ImageLibrary;
  onDelete: (id: string) => void;
  onEdit: (entry: ImageEntry) => void;
  onPreview: (entry: ImageEntry) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkAddTags: (ids: string[], tags: string[]) => void;
  onSaveCollection: (name: string, ids: string[]) => void;
  allTags: string[];
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ library, onDelete, onEdit, onPreview, onBulkDelete, onBulkAddTags, onSaveCollection, allTags, onExport, onImport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isSaveCollectionModalOpen, setIsSaveCollectionModalOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const filteredLibrary = useMemo(() => {
    return library.filter(entry => {
      const searchMatch = searchQuery.trim() === '' ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const filterMatch = activeFilters.length === 0 || activeFilters.every(filter => entry.tags.includes(filter));

      return searchMatch && filterMatch;
    });
  }, [library, searchQuery, activeFilters]);
  
  useEffect(() => {
    if (!isSelectMode) {
      setSelectedIds([]);
    }
  }, [isSelectMode]);

  const toggleTagFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCardClick = (entry: ImageEntry) => {
    if (isSelectMode) {
      setSelectedIds(prev =>
        prev.includes(entry.id) ? prev.filter(i => i !== entry.id) : [...prev, entry.id]
      );
    } else {
      onPreview(entry);
    }
  };

  const handleBulkDelete = () => {
    if(window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
        onBulkDelete(selectedIds);
        setIsSelectMode(false);
    }
  }
  
  const handleBulkTagSave = (tags: string[]) => {
      onBulkAddTags(selectedIds, tags);
      setIsBulkTagModalOpen(false);
      setIsSelectMode(false);
  }

  const handleSaveCollection = (name: string) => {
    onSaveCollection(name, selectedIds);
    setIsSaveCollectionModalOpen(false);
    setIsSelectMode(false);
  }

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-grow">
            <h2 className="text-sm font-semibold text-surface-content mb-2">{filteredLibrary.length} Items</h2>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-content"/>
              <input 
                type="text"
                placeholder="Search by title, prompt, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-sm bg-surface pl-10 pr-4 py-2 rounded-md border border-white/10 focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                ref={filterButtonRef}
                onClick={() => setIsFilterOpen(prev => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10"
              >
                <FilterIcon className="w-5 h-5"/>
                <span>Filter</span>
                {activeFilters.length > 0 && <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs">{activeFilters.length}</span>}
              </button>
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-surface rounded-lg border border-white/20 shadow-2xl z-20 p-4">
                  <h3 className="font-semibold mb-2">Filter by Tags</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {allTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={activeFilters.includes(tag)} onChange={() => toggleTagFilter(tag)}
                         className="h-4 w-4 rounded bg-background border-white/20 text-primary focus:ring-primary focus:ring-offset-surface"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                   {activeFilters.length > 0 && <button onClick={() => setActiveFilters([])} className="text-xs text-primary mt-3">Clear filters</button>}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsSelectMode(prev => !prev)}
              className={`px-4 py-2 rounded-md font-medium transition-colors border ${isSelectMode ? 'bg-primary text-white border-primary' : 'bg-surface hover:bg-white/5 text-content border-white/10'}`}
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            <button
                onClick={onExport}
                className="p-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10"
                title="Export Library & Collections"
            >
                <ArrowDownTrayIcon className="w-5 h-5"/>
            </button>
            <label
                htmlFor="import-file"
                className="cursor-pointer p-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10"
                title="Import Library & Collections"
            >
                <ArrowUpTrayIcon className="w-5 h-5"/>
                <input id="import-file" type="file" accept=".json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </div>

        {filteredLibrary.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-20rem)]">
             <h2 className="mt-4 text-xl font-bold text-content">No Results Found</h2>
              <p className="text-surface-content mt-2 max-w-md mx-auto">
                Try adjusting your search or filters.
              </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-6">
            {filteredLibrary.map(entry => (
              <ImageCard 
                key={entry.id} 
                entry={entry} 
                onDelete={onDelete} 
                onEdit={onEdit}
                onClick={() => handleCardClick(entry)}
                isSelected={selectedIds.includes(entry.id)}
                isSelectMode={isSelectMode}
              />
            ))}
          </div>
        )}
      </div>

      {isSelectMode && selectedIds.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-lg border-t border-white/10 p-4 shadow-2xl animate-slide-up">
              <div className="container mx-auto flex items-center justify-between">
                  <span className="font-semibold">{selectedIds.length} items selected</span>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsBulkTagModalOpen(true)}
                        className="px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10 text-sm"
                      >
                          Add Tags...
                      </button>
                      <button 
                        onClick={() => setIsSaveCollectionModalOpen(true)}
                        className="px-4 py-2 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors border border-white/10 text-sm"
                      >
                          Save as Collection...
                      </button>
                      <button 
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-500/20 rounded-md text-red-400 font-medium transition-colors text-sm flex items-center gap-2"
                      >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isBulkTagModalOpen && (
        <BulkAddTagsModal 
            onClose={() => setIsBulkTagModalOpen(false)}
            onSave={handleBulkTagSave}
            allTags={allTags}
        />
      )}

      {isSaveCollectionModalOpen && (
        <SaveCollectionModal
          onClose={() => setIsSaveCollectionModalOpen(false)}
          onSave={handleSaveCollection}
          itemCount={selectedIds.length}
        />
      )}
    </>
  );
};

export default LibraryView;