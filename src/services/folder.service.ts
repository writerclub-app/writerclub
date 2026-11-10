
import { db } from '@/db'
import { loadToken } from '@/services/auth.service'
import type { Folder, FolderCreate, FolderUpdate } from '@/types/folder'

export async function getFolders(): Promise<Folder[]> {
  const token = loadToken()
  if (!token) return []
  return db.folders.where('authorId').equals(token.authId).sortBy('updatedAt')
}

export async function getFolderById(id: string): Promise<Folder | undefined> {
  return db.folders.get(id)
}

export async function createFolder(data: Omit<FolderCreate, 'authorId' | 'isPublic'>): Promise<Folder> {
  const token = loadToken()
  if (!token) throw new Error('Not authenticated')

  const now = new Date()
  const folder: Folder = {
    id: crypto.randomUUID(),
    authorId: token.authId,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  }
  await db.folders.put(folder)
  return folder
}

export async function updateFolder(id: string, data: Partial<Pick<Folder, 'name' | 'isPublic'>>): Promise<void> {
  await db.folders.update(id, { ...data, updatedAt: new Date() } as FolderUpdate)
}

export async function deleteFolder(id: string): Promise<void> {
  // Remove folder ref from writings but keep them (move to "no folder")
  const writings = await db.writings.where('folderId').equals(id).toArray()
  await Promise.all(
    writings.map((w) => db.writings.update(w.id, { folderId: undefined, updatedAt: new Date() }))
  )
  await db.folders.delete(id)
}
