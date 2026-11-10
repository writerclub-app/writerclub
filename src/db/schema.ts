import Dexie, { type EntityTable } from 'dexie'
import type { Writing } from '@/types/writing'
import type { Folder } from '@/types/folder'
import type { Category } from '@/types/category'
import type { Profile } from '@/types/profile'

class WriterClubDB extends Dexie {
  writings!: EntityTable<Writing, 'id'>
  folders!: EntityTable<Folder, 'id'>
  categories!: EntityTable<Category, 'id'>
  profile!: EntityTable<Profile, 'id'>

  constructor() {
    super('writerclub')

    // v1 — schema original
    this.version(1).stores({
      writings:   '++id, authorId, categoryId, folderId, slug, isPublic, updatedAt',
      folders:    '++id, authorId, isPublic',
      categories: '++id, authorId',
      profile:    '++id',
    })

    // v2 — adiciona índices em profile:
    //   authId  → lookup pelo OAuth sub (login)
    //   username → lookup por handle público (/u/:username) e checagem de unicidade
    this.version(2).stores({
      profile: '++id, authId, username',
    })
  }
}

export const db = new WriterClubDB()
