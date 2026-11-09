export interface Folder {
  id: string
  name: string
  authorId: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export type FolderCreate = Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>
export type FolderUpdate = Partial<Omit<Folder, 'id' | 'authorId' | 'createdAt'>> & { updatedAt: Date }
