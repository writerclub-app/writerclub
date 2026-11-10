
import { db } from '@/db'
import { slugify } from '@/utils/slugify'
import type { Writing, WritingCreate, WritingUpdate } from '@/types/writing'

export async function getWriting(id: string): Promise<Writing | undefined> {
  return db.writings.get(id)
}

export async function createWriting(data: Omit<WritingCreate, 'slug'>): Promise<Writing> {
  const now = new Date()
  const writing: Writing = {
    id: crypto.randomUUID(),
    slug: slugify(data.title) || crypto.randomUUID().slice(0, 8),
    createdAt: now,
    updatedAt: now,
    ...data,
  }
  await db.writings.add(writing)
  return writing
}

export async function updateWriting(id: string, data: Omit<WritingUpdate, 'updatedAt'>): Promise<void> {
  const patch: WritingUpdate = { ...data, updatedAt: new Date() }
  if (data.title !== undefined) {
    patch.slug = slugify(data.title) || id.slice(0, 8)
  }
  await db.writings.update(id, patch)
}

export async function deleteWriting(id: string): Promise<void> {
  await db.writings.delete(id)
}
