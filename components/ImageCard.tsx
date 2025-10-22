import React from 'react';
import type { ImageEntry } from '../types';
import { CheckCircleIcon, CloseIcon, EditIcon } from './icons';

interface ImageCardProps {
  entry: ImageEntry;
  onClick?: () => void;
  isSelected?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (entry: ImageEntry) => void;
  isSelectMode?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ entry, onClick, isSelected, onDelete, onEdit, isSelectMode }) => {
  const cardClasses = `
    group relative overflow-hidden rounded-lg bg-surface transition-transform duration-300 ease-in-out break-inside-avoid mb-6
    ${onClick ? 'cursor-pointer' : ''}
    ${isSelected ? '' : 'hover:scale-105'}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <img src={entry.imageData} alt={entry.title} className={`w-full h-auto transition-all duration-300 ${isSelected ? 'brightness-50' : ''}`} />
      
      {/* Overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-300 
        ${isSelected ? 'bg-black/40' : (isSelectMode ? 'group-hover:bg-black/20' : '')}`}
      >
        {isSelected && (
          <div className="flex items-center justify-center h-full">
            <CheckCircleIcon className="w-12 h-12 text-white/90" />
          </div>
        )}
      </div>

      {/* Title */}
      <div className={`absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black/60 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <h3 className="text-white font-semibold truncate text-sm">{entry.title}</h3>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDelete && !isSelectMode && (
           <button 
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              className="p-1.5 bg-black/50 hover:bg-red-600 backdrop-blur-sm rounded-full text-white"
              aria-label="Delete image"
            >
              <CloseIcon className="w-4 h-4" />
           </button>
        )}
        {onEdit && !isSelectMode && (
           <button 
              onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
              className="p-1.5 bg-black/50 hover:bg-primary backdrop-blur-sm rounded-full text-white"
              aria-label="Edit image"
            >
              <EditIcon className="w-4 h-4" />
           </button>
        )}
      </div>
    </div>
  );
};

export default ImageCard;