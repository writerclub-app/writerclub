import { useCallback, useState } from 'react'
import { runBackup, restoreBackup, getLastSyncTime, getActiveProvider } from '@/services/backup.service'
import { loadToken } from '@/services/auth.service'
import { db } from '@/db'

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'
type RestoreStatus = 'idle' | 'restoring' | 'success' | 'error' | 'skipped'

export function useSyncBackup() {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(getLastSyncTime)
  const [error, setError] = useState<string | null>(null)
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>('idle')

  const sync = useCallback(async () => {
    const token = loadToken()
    if (!token) return
    setStatus('syncing')
    setError(null)
    try {
      await runBackup(token.authId)
      setLastSyncedAt(new Date())
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }, [])

  /** Restore manual — sempre executa independente do DB estar vazio ou não. */
  const restore = useCallback(async () => {
    const token = loadToken()
    if (!token) return
    setRestoreStatus('restoring')
    try {
      await restoreBackup(token.authId)
      setRestoreStatus('success')
      setTimeout(() => setRestoreStatus('idle'), 3000)
    } catch (err) {
      setRestoreStatus('error')
      setError(err instanceof Error ? err.message : 'Erro ao restaurar')
    }
  }, [])

  /**
   * Restore automático: só executa na primeira vez (DB local vazio).
   * Chamar no mount da HomePage após carregar o DB.
   */
  const restoreIfEmpty = useCallback(async () => {
    const token = loadToken()
    if (!token) return
    const provider = getActiveProvider()
    if (!provider) return
    const count = await db.writings.count()
    if (count > 0) {
      setRestoreStatus('skipped')
      return
    }
    setRestoreStatus('restoring')
    try {
      await restoreBackup(token.authId)
      setRestoreStatus('success')
    } catch {
      // Silencioso — pode não ter backup ainda
      setRestoreStatus('idle')
    }
  }, [])

  return { sync, status, lastSyncedAt, error, restore, restoreIfEmpty, restoreStatus }
}
