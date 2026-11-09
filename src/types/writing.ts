export interface Writing {
  id: string
  title: string
  content: string // Tiptap JSON serialized as string
  categoryId: string
  categoryName: string // denormalized for public sync
  folderId?: string
  slug: string
  isPublic: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export type WritingCreate = Omit<Writing, 'id' | 'createdAt' | 'updatedAt'>
export type WritingUpdate = Partial<Omit<Writing, 'id' | 'authorId' | 'createdAt'>> & { updatedAt: Date }
