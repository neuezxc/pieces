
export interface ImageEntry {
  id: string;
  imageData: string;
  title: string;
  notes?: string;
  prompt: string;
  tags: string[];
  dateAdded: string; // Stored as ISO string
}

export type ImageLibrary = ImageEntry[];

export interface Collection {
  id: string;
  name: string;
  imageEntryIds: string[];
  dateCreated: string; // Stored as ISO string
}

export type CollectionsList = Collection[];


export enum View {
  LIBRARY = 'LIBRARY',
  BUILDER = 'BUILDER',
  COLLECTIONS = 'COLLECTIONS',
}
