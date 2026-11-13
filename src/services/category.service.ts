
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

const DEFAULT_CATEGORIES = ['poem', 'music', 'tale', 'chronicle']

export async function seedDefaultCategories(authorId: string): Promise<Category[]> {
  const now = new Date()
  const defaults: Category[] = DEFAULT_CATEGORIES.map((slug) => ({
    id: `default-${authorId}-${slug}`,
    name: slug,
    authorId,
    createdAt: now,
    updatedAt: now,
  }))

  const slugIds = new Set(defaults.map((d) => d.id))

  // Remove registros antigos que não têm ID determinístico (migração)
  const existing = await getCategories(authorId)
  const legacy = existing.filter((c) => !slugIds.has(c.id))
  if (legacy.length > 0) {
    await db.categories.bulkDelete(legacy.map((c) => c.id))
  }

  // Upsert sempre — idempotente, sem duplicatas mesmo com StrictMode
  await db.categories.bulkPut(defaults)
  return defaults
}
