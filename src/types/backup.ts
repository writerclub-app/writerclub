import type { BackupProviderName } from '@/types/profile'

export interface BackupProvider {
  name: BackupProviderName
  label: string
  isAuthenticated(): boolean
  authenticate(): Promise<void>
  upload(data: Uint8Array, filename: string): Promise<void>
  download(filename: string): Promise<Uint8Array | null>
  getMetadata(filename: string): Promise<{ lastModified: Date } | null>
}

export interface BackupState {
  provider: BackupProvider | null
  status: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncedAt: Date | null
  error: string | null
}

export interface BackupPayload {
  version: number
  userId: string
  exportedAt: string
  writings: unknown[]
  folders: unknown[]
  categories: unknown[]
}
