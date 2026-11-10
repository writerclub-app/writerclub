
import { db } from '@/db'
import type { Category, CategoryCreate } from '@/types/category'

export async function getCategories(authorId: string): Promise<Category[]> {
  return db.categories.where('authorId').equals(authorId).toArray()
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  const now = new Date()
  const category: Category = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...data }
  await db.categories.add(category)
  return category
}

const DEFAULT_CATEGORIES = ['Poema', 'Música', 'Conto', 'Crônica']

export async function seedDefaultCategories(authorId: string): Promise<Category[]> {
  const existing = await getCategories(authorId)
  if (existing.length > 0) return existing
  const created = await Promise.all(
    DEFAULT_CATEGORIES.map((name) => createCategory({ name, authorId }))
  )
  return created
}
