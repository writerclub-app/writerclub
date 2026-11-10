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

    this.version(1).stores({
      writings:   '++id, authorId, categoryId, folderId, slug, isPublic, updatedAt',
      folders:    '++id, authorId, isPublic',
      categories: '++id, authorId',
      profile:    '++id',
    })

    // v2: todas as tabelas usam UUID manual (string) como primary key
    // profile.authId indexado para lookup por OAuth sub
    this.version(2).stores({
      writings:   'id, authorId, categoryId, folderId, slug, isPublic, updatedAt',
      folders:    'id, authorId, isPublic',
      categories: 'id, authorId',
      profile:    'id, authId',
    })
  }
}

export const db = new WriterClubDB()
