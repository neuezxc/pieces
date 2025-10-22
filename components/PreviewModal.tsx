import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ImageEntry } from '../types';
import { CloseIcon, CopyIcon, CheckIcon, EditIcon } from './icons';

interface PreviewModalProps {
  entry: ImageEntry;
  onClose: () => void;
  onEdit: (entry: ImageEntry) => void;
  onDelete: (id: string) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => onEdit(entry)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-white/5 rounded-md text-content font-medium transition-colors text-sm"
                >
                    <EditIcon className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(entry.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-red-600/20 rounded-md text-red-400 font-medium transition-colors text-sm"
                >
                    Delete
                </button>
            </div>
             <button onClick={onClose} className="text-surface-content hover:text-content transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
            {/* Image Column */}
            <div className="flex items-center justify-center bg-background/50 rounded-lg p-2">
              <img src={entry.imageData} alt={entry.title} className="rounded-md object-contain w-full max-h-[70vh]" />
            </div>

            {/* Details Column */}
            <div className="flex flex-col space-y-5">
                <div>
                    <h2 className="text-3xl font-bold text-content">{entry.title}</h2>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-surface-content">Prompt</label>
                        <button onClick={handleCopy} className="flex items-center space-x-1.5 text-xs text-primary font-semibold">
                            {isCopied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                    <div className="w-full bg-background border border-white/10 rounded-md p-3 text-content/90 max-h-48 overflow-y-auto text-sm">
                        {entry.prompt}
                    </div>
                </div>

                {entry.tags.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-surface-content mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                             {entry.tags.map(tag => (
                                <span key={tag} className="bg-primary/20 text-content rounded-md px-2.5 py-1 text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {entry.notes && (
                    <div>
                        <label className="block text-sm font-medium text-surface-content mb-1">Notes</label>
                         <div className="w-full bg-transparent text-content/80 text-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-2 text-content" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-2 text-content" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2 text-content" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                                    a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 pl-4" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 pl-4" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    code: ({node, inline, className, children, ...props}) => {
                                        return !inline ? (
                                            <pre className="bg-background/50 p-3 rounded-md my-2 overflow-x-auto">
                                                <code className={`text-sm ${className || ''}`} {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        ) : (
                                            <code className="bg-background/80 px-1.5 py-1 rounded text-sm" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-surface-content/50 pl-4 my-2 italic text-surface-content" {...props} />,
                                    hr: ({node, ...props}) => <hr className="border-surface my-4" {...props} />,
                                    table: ({node, ...props}) => <table className="table-auto w-full my-2 border-collapse border border-surface" {...props} />,
                                    thead: ({node, ...props}) => <thead className="bg-surface" {...props} />,
                                    th: ({node, ...props}) => <th className="border border-surface px-4 py-2 text-left font-semibold text-content" {...props} />,
                                    td: ({node, ...props}) => <td className="border border-surface px-4 py-2" {...props} />,
                                }}
                            >
                                {entry.notes}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;