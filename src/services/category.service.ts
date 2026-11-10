
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
