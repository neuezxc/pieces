
import { useEffect, useCallback } from 'react';

type PasteHandler = (imageDataUrl: string) => void;

const isImageUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(parsedUrl.pathname);
    } catch (_) {
        return false;
    }
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const usePaste = (onPaste: PasteHandler, onError: (message: string) => void) => {
    const handlePaste = useCallback(async (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        let pasted = false;

        // Handle direct image paste
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    try {
                        const dataUrl = await blobToDataURL(blob);
                        onPaste(dataUrl);
                        pasted = true;
                    } catch (error) {
                        onError("Failed to read pasted image data.");
                    }
                }
                event.preventDefault();
                return;
            }
        }
        
        // Handle URL paste
        const text = event.clipboardData.getData('text/plain');
        if (text && isImageUrl(text)) {
             try {
                const response = await fetch(text);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const blob = await response.blob();
                const dataUrl = await blobToDataURL(blob);
                onPaste(dataUrl);
                pasted = true;
            } catch (error) {
                console.error("Failed to fetch image from URL:", error);
                onError("Could not fetch image from the provided URL. Please check the URL and try again.");
            }
             event.preventDefault();
             return;
        }

    }, [onPaste, onError]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);
};
