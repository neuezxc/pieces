import React, { useState, useCallback, useMemo } from 'react';
import type { ImageEntry, ImageLibrary, Collection } from './types';
import { View } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { usePaste } from './hooks/usePaste';

import Header from './components/Header';
import LibraryView from './components/LibraryView';
import BuilderView from './components/BuilderView';
import AddImageModal from './components/AddImageModal';
import PreviewModal from './components/PreviewModal';
import CollectionsView from './components/CollectionsView';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LIBRARY);
  const [imageLibrary, setImageLibrary] = useLocalStorage<ImageLibrary>('promptforge-library', []);
  const [collections, setCollections] = useLocalStorage<Collection[]>('promptforge-collections', []);
  
  const [pastedImageData, setPastedImageData] = useState<string | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<ImageEntry | null>(null);
  const [previewingEntry, setPreviewingEntry] = useState<ImageEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [builderComponents, setBuilderComponents] = useState<ImageEntry[]>([]);

  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');


  const handlePaste = useCallback((dataUrl: string) => {
    setEntryToEdit(null); // Clear any editing state
    setPastedImageData(dataUrl);
  }, []);

  const handleError = useCallback((message: string) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
  }, []);

  usePaste(handlePaste, handleError);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    imageLibrary.forEach(entry => entry.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [imageLibrary]);

  const handleSaveImage = (entryData: Omit<ImageEntry, 'dateAdded'>, isEdit: boolean) => {
    if (isEdit) {
        setImageLibrary(prev => prev.map(e => e.id === entryData.id ? { ...e, ...entryData } : e));
    } else {
        const newEntry: ImageEntry = {
          ...entryData,
          dateAdded: new Date().toISOString(),
        };
        setImageLibrary(prev => [newEntry, ...prev]);
    }
  };

  const handleDeleteImage = (idToDelete: string, onConfirm?: () => void) => {
    if(window.confirm('Are you sure you want to delete this component?')) {
        setImageLibrary(prev => prev.filter(entry => entry.id !== idToDelete));
        onConfirm?.();
    }
  };
  
  const handleEditImage = (entry: ImageEntry) => {
      setPastedImageData(null);
      setEntryToEdit(entry);
  }

  const handleBulkDelete = (ids: string[]) => {
      setImageLibrary(prev => prev.filter(entry => !ids.includes(entry.id)));
  }

  const handleBulkAddTags = (ids: string[], tags: string[]) => {
      setImageLibrary(prev => prev.map(entry => {
          if (ids.includes(entry.id)) {
              const newTags = Array.from(new Set([...entry.tags, ...tags]));
              return { ...entry, tags: newTags };
          }
          return entry;
      }))
  }

  const handleSaveCollection = (name: string, imageEntryIds: string[]) => {
    const newCollection: Collection = {
        id: `col_${Date.now()}`,
        name,
        imageEntryIds,
        dateCreated: new Date().toISOString(),
    };
    setCollections(prev => [newCollection, ...prev]);
  };

  const handleLoadCollection = (collection: Collection) => {
      const components = collection.imageEntryIds
          .map(id => imageLibrary.find(entry => entry.id === id))
          .filter((entry): entry is ImageEntry => !!entry);
      setBuilderComponents(components);
      setView(View.BUILDER);
  };

  const handleDeleteCollection = (collectionId: string) => {
      if (window.confirm('Are you sure you want to delete this collection? This will not delete the components inside.')) {
          setCollections(prev => prev.filter(c => c.id !== collectionId));
      }
  }

  const handleExport = useCallback(() => {
    try {
        const dataToExport = {
            version: 1,
            library: imageLibrary,
            collections: collections,
        };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().slice(0, 10);
        link.download = `promptforge_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Failed to export data:", err);
        handleError("Failed to export library. See console for details.");
    }
  }, [imageLibrary, collections, handleError]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error("File could not be read.");
              
              const data = JSON.parse(text);

              if (!data.library || !Array.isArray(data.library) || !data.collections || !Array.isArray(data.collections)) {
                  throw new Error("Invalid file format. The file must contain 'library' and 'collections' arrays.");
              }

              if (window.confirm("Are you sure you want to import this file? This will REPLACE all your current data.")) {
                  setImageLibrary(data.library);
                  setCollections(data.collections);
                  alert("Import successful! Your library has been updated.");
              }
          } catch (err) {
              console.error("Failed to import data:", err);
              const message = err instanceof Error ? err.message : "Failed to import library. The file may be corrupt or in the wrong format.";
              handleError(message);
          } finally {
              event.target.value = '';
          }
      };
      reader.onerror = () => {
           handleError("Error reading the selected file.");
           event.target.value = '';
      }
      reader.readAsText(file);
  }, [setImageLibrary, setCollections, handleError]);
  
  const handleInvalidApiKey = useCallback(() => {
    setApiKey('');
    setApiKeyError('Your API key is invalid or has been rejected. Please enter a valid key.');
    setIsApiKeyModalOpen(true);
  }, [setApiKey]);

  const isAddModalOpen = !!pastedImageData || !!entryToEdit;

  return (
    <div className="h-screen flex flex-col font-sans bg-background">
        <Header 
            currentView={view} 
            setView={setView} 
            onApiKeyClick={() => {
                setApiKeyError('');
                setIsApiKeyModalOpen(true);
            }}
        />
        <main className="flex-grow overflow-hidden">
            {view === View.LIBRARY && (
              <div className="h-full overflow-y-auto">
                <LibraryView 
                  library={imageLibrary} 
                  onDelete={(id) => handleDeleteImage(id)} 
                  onEdit={handleEditImage}
                  onPreview={setPreviewingEntry}
                  onBulkDelete={handleBulkDelete}
                  onBulkAddTags={handleBulkAddTags}
                  onSaveCollection={handleSaveCollection}
                  allTags={allTags}
                  onExport={handleExport}
                  onImport={handleImport}
                />
              </div>
            )}
            {view === View.BUILDER && <BuilderView library={imageLibrary} selectedComponents={builderComponents} setSelectedComponents={setBuilderComponents} />}
            {view === View.COLLECTIONS && (
              <CollectionsView
                collections={collections}
                library={imageLibrary}
                onLoad={handleLoadCollection}
                onDelete={handleDeleteCollection}
                setView={setView}
              />
            )}
        </main>

        {isAddModalOpen && (
            <AddImageModal 
                imageData={pastedImageData}
                entryToEdit={entryToEdit}
                onClose={() => {
                  setPastedImageData(null)
                  setEntryToEdit(null)
                }}
                onSave={handleSaveImage}
                allTags={allTags}
                apiKey={apiKey}
                onInvalidApiKey={handleInvalidApiKey}
                openApiKeyModal={() => {
                    setApiKeyError('');
                    setIsApiKeyModalOpen(true);
                }}
            />
        )}
        
        {previewingEntry && (
            <PreviewModal
                entry={previewingEntry}
                onClose={() => setPreviewingEntry(null)}
                onEdit={(entry) => {
                    setPreviewingEntry(null);
                    handleEditImage(entry);
                }}
                onDelete={(id) => {
                    handleDeleteImage(id, () => setPreviewingEntry(null));
                }}
            />
        )}

        {isApiKeyModalOpen && (
            <ApiKeyModal
                initialKey={apiKey}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={(key) => {
                    setApiKey(key);
                    setIsApiKeyModalOpen(false);
                }}
                errorMessage={apiKeyError}
            />
        )}

        {error && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-900/80 backdrop-blur-md text-red-100 px-5 py-2.5 rounded-lg shadow-lg z-50 border border-red-500/30 animate-fade-in-up">
                <p className="font-semibold text-sm">{error}</p>
            </div>
        )}
    </div>
  );
};

export default App;
