import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Badge } from '@awakr/awake-ui/badge'
import { GoogleIcon } from '@/components/ui/icons'
import { useSyncBackup } from '@/hooks/useSyncBackup'
import { getActiveProvider } from '@/services/backup.service'
import './BackupStatus.css'

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  return date.toLocaleDateString()
}

export function BackupStatus() {
  const { t } = useTranslation()
  const { sync, status, lastSyncedAt, error } = useSyncBackup()
  const provider = getActiveProvider()


  return (
    <div className="backup-status">
      <div className="backup-status__header">
        <div className="backup-status__provider">
          <GoogleIcon />
          <span className="backup-status__name">
            {'Google Drive'}
          </span>
          <Badge variant="success" className="backup-status__badge">
            {t('backup.connected')}
          </Badge>
        </div>
      </div>

      <p className="backup-status__info">{t('backup.auto_info')}</p>

      {lastSyncedAt && (
        <p className="backup-status__last">{t('backup.last_sync')}: {formatRelative(lastSyncedAt)}</p>
      )}

      {error && <p className="backup-status__error">{error}</p>}

      <Button
        variant="secondary"
        onClick={() => void sync()}
        disabled={status === 'syncing'}
        className="backup-status__btn"
      >
        {status === 'syncing'
          ? t('backup.syncing')
          : status === 'success'
            ? `✓ ${t('backup.synced')}`
            : t('backup.sync_now')}
      </Button>
    </div>
  )
}
