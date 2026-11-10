import { useCallback, useState } from 'react'
import { runBackup, getLastSyncTime } from '@/services/backup.service'
import { loadToken } from '@/services/auth.service'

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export function useSyncBackup() {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(getLastSyncTime)
  const [error, setError] = useState<string | null>(null)

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

  return { sync, status, lastSyncedAt, error }
}
