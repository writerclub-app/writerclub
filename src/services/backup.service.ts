import { db } from '@/db'
import { githubGistProvider } from './backup/github-gist.provider'
import { googleDriveProvider } from './backup/google-drive.provider'
import type { BackupProvider, BackupPayload } from '@/types/backup'

const LAST_SYNC_KEY = 'byos_last_sync'
const FILENAME = 'writerclub-backup.json'

/** Returns the active provider if one is configured and authenticated. */
export function getActiveProvider(): BackupProvider | null {
  if (googleDriveProvider.isAuthenticated()) return googleDriveProvider
  if (githubGistProvider.isAuthenticated()) return githubGistProvider
  return null
}

/** Collect all local data and return as a serialisable payload. */
async function buildPayload(authorId: string): Promise<BackupPayload> {
  const [writings, folders, categories, profile] = await Promise.all([
    db.writings.where('authorId').equals(authorId).toArray(),
    db.folders.where('authorId').equals(authorId).toArray(),
    db.categories.where('authorId').equals(authorId).toArray(),
    db.profile.where('authId').equals(authorId).toArray(),
  ])
  return {
    version: 1,
    userId: authorId,
    exportedAt: new Date().toISOString(),
    writings,
    folders,
    categories,
    profile,
  }
}

/** Run a full backup to the active provider. Throws on failure. */
export async function runBackup(authorId: string): Promise<void> {
  const provider = getActiveProvider()
  if (!provider) throw new Error('No backup provider configured')

  const payload = await buildPayload(authorId)
  const json = JSON.stringify(payload, null, 2)
  const data = new TextEncoder().encode(json)

  await provider.upload(data, FILENAME)

  try { localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString()) } catch { /* ignore */ }
}

/** Restore from backup — merges remote data into local DB (upsert by id). */
export async function restoreBackup(authorId: string): Promise<{ writings: number; folders: number }> {
  const provider = getActiveProvider()
  if (!provider) throw new Error('No backup provider configured')

  const raw = await provider.download(FILENAME)
  if (!raw) throw new Error('No backup found in provider')

  const json = new TextDecoder().decode(raw)
  const payload = JSON.parse(json) as BackupPayload

  if (payload.userId !== authorId) {
    throw new Error('Backup pertence a outro usuário')
  }

  await db.transaction('rw', [db.writings, db.folders, db.categories, db.profile], async () => {
    for (const w of payload.writings as Parameters<typeof db.writings.put>[0][]) {
      await db.writings.put(w)
    }
    for (const f of payload.folders as Parameters<typeof db.folders.put>[0][]) {
      await db.folders.put(f)
    }
    for (const c of payload.categories as Parameters<typeof db.categories.put>[0][]) {
      await db.categories.put(c)
    }
    for (const p of (payload.profile ?? []) as Parameters<typeof db.profile.put>[0][]) {
      await db.profile.put(p)
    }
  })

  return {
    writings: (payload.writings as unknown[]).length,
    folders: (payload.folders as unknown[]).length,
  }
}

/** Returns the last sync timestamp from localStorage. */
export function getLastSyncTime(): Date | null {
  try {
    const v = localStorage.getItem(LAST_SYNC_KEY)
    return v ? new Date(v) : null
  } catch { return null }
}
