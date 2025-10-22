import React from 'react';
// FIX: 'View' is an enum used as a value, so it cannot be imported with 'import type'.
import type { Collection, CollectionsList, ImageEntry } from '../types';
import { View } from '../types';
import CollectionCard from './CollectionCard';
import { FolderIcon } from './icons';

interface CollectionsViewProps {
  collections: CollectionsList;
  library: ImageEntry[];
  onLoad: (collection: Collection) => void;
  onDelete: (id: string) => void;
  setView: (view: View) => void;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ collections, library, onLoad, onDelete, setView }) => {
    if (collections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-12rem)] animate-fade-in">
                <FolderIcon className="w-16 h-16 text-surface-content/50 mb-4"/>
                <h2 className="text-xl font-bold text-content">No Collections Yet</h2>
                <p className="text-surface-content mt-2 max-w-sm">
                    Go to the Library, select some components, and use the 'Save as Collection' option to get started.
                </p>
                <button
                    onClick={() => setView(View.LIBRARY)}
                    className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition-colors"
                >
                    Go to Library
                </button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in h-full overflow-y-auto">
            <h2 className="text-3xl font-bold mb-8 text-content">Collections <span className="text-surface-content font-medium">({collections.length})</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collections.map(collection => (
                    <CollectionCard 
                        key={collection.id}
                        collection={collection}
                        library={library}
                        onLoad={() => onLoad(collection)}
                        onDelete={() => onDelete(collection.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CollectionsView;