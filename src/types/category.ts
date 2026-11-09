export interface Category {
  id: string
  name: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

export type CategoryCreate = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
