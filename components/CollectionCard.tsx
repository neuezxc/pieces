import React from 'react';
import type { Collection, ImageEntry } from '../types';
import { LightbulbIcon, TrashIcon } from './icons';

interface CollectionCardProps {
    collection: Collection;
    library: ImageEntry[];
    onLoad: () => void;
    onDelete: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, library, onLoad, onDelete }) => {
    const images = collection.imageEntryIds
        .map(id => library.find(item => item.id === id))
        .filter((entry): entry is ImageEntry => !!entry)
        .slice(0, 4);

    return (
        <div className="bg-surface rounded-lg border border-white/10 flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-2xl">
            <div className="p-4">
                <h3 className="font-bold text-content truncate text-lg">{collection.name}</h3>
                <p className="text-xs text-surface-content">{collection.imageEntryIds.length} item{collection.imageEntryIds.length !== 1 ? 's' : ''}</p>
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-px bg-white/10 aspect-video">
                    {images.map(image => (
                        <div key={image.id} className="overflow-hidden bg-background">
                            <img src={image.imageData} alt={image.title} className="w-full h-full object-cover"/>
                        </div>
                    ))}
                    {/* Fill empty spots */}
                    {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="bg-background"></div>
                    ))}
                </div>
            ) : (
                <div className="aspect-video bg-background flex items-center justify-center">
                    <p className="text-sm text-surface-content">Empty Collection</p>
                </div>
            )}
            
            <div className="p-3 mt-auto border-t border-white/10 flex items-center justify-between gap-2">
                <button 
                    onClick={onLoad}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/80 rounded-md text-white font-semibold transition-colors text-sm"
                >
                    <LightbulbIcon className="w-4 h-4"/>
                    Load in Builder
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 bg-surface hover:bg-red-600/20 rounded-md text-red-400 font-medium transition-colors"
                    aria-label="Delete collection"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    )
};

export default CollectionCard;
