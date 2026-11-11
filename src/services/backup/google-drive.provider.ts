import type { BackupProvider } from '@/types/backup'

const TOKEN_KEY    = 'byos_gdrive_token'
const EXPIRY_KEY   = 'byos_gdrive_token_expiry'
const FOLDER_KEY   = 'byos_gdrive_folder_id'
const FILE_KEY     = 'byos_gdrive_file_id'

const SCOPE        = 'https://www.googleapis.com/auth/drive.file'
const DRIVE_API    = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API   = 'https://www.googleapis.com/upload/drive/v3'
const FOLDER_NAME  = 'WriterClub'
const FILENAME     = 'writerclub-backup.json'

type TokenResponse = { access_token: string; expires_in: number; error?: string }
type TokenError     = { type: string; message?: string }
type TokenClient    = { requestAccessToken: (cfg?: { prompt?: string }) => void }
type TokenClientCfg = {
  client_id: string
  scope: string
  callback: (r: TokenResponse) => void
  error_callback?: (e: TokenError) => void
}

function getGoogle(): { accounts: { oauth2: { initTokenClient: (cfg: TokenClientCfg) => TokenClient } } } | null {
  return (window as unknown as { google?: typeof getGoogle extends () => infer R ? R : never }).google ?? null
}

export class GoogleDriveProvider implements BackupProvider {
  readonly name  = 'google-drive' as const
  readonly label = 'Google Drive'

  // ── Token ────────────────────────────────────────────────────────────────

  private get token(): string | null {
    try {
      const expiry = localStorage.getItem(EXPIRY_KEY)
      if (!expiry || Date.now() > parseInt(expiry)) { this._clearStoredToken(); return null }
      return localStorage.getItem(TOKEN_KEY)
    } catch { return null }
  }

  private _setToken(token: string, expiresIn: number): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + (expiresIn - 60) * 1000))
    } catch { /* ignore */ }
  }

  private _clearStoredToken(): void {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EXPIRY_KEY) } catch { /* ignore */ }
  }

  isAuthenticated(): boolean { return !!this.token }

  // ── OAuth popup ───────────────────────────────────────────────────────────

  authenticate(silent = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
      const google = window as unknown as { google?: GoogleAccounts }
      if (!google.google?.accounts?.oauth2) { reject(new Error('Google API não disponível')); return }
      const client = google.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        callback: (res) => {
          if (res.error) { reject(new Error(res.error)); return }
          this._setToken(res.access_token, res.expires_in)
          resolve()
        },
        error_callback: (err: TokenError) => {
          reject(new Error(err?.type === 'popup_closed' ? 'Popup fechado pelo usuário' : (err?.message ?? err?.type ?? 'Erro de autenticação')))
        },
      })
      client.requestAccessToken({ prompt: silent ? '' : 'select_account' })
    })
  }

  clearToken(): void {
    this._clearStoredToken()
    try { localStorage.removeItem(FOLDER_KEY); localStorage.removeItem(FILE_KEY) } catch { /* ignore */ }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async ensureToken(): Promise<string> {
    let tok = this.token
    if (!tok) {
      try { await this.authenticate(true); tok = this.token } catch { /* silent failed */ }
    }
    if (!tok) throw new Error('GDRIVE_AUTH_REQUIRED')
    return tok
  }

  private get storedFolderId(): string | null {
    try { return localStorage.getItem(FOLDER_KEY) } catch { return null }
  }

  private get storedFileId(): string | null {
    try { return localStorage.getItem(FILE_KEY) } catch { return null }
  }

  private async ensureFolder(token: string): Promise<string> {
    if (this.storedFolderId) return this.storedFolderId

    // Try to find existing folder
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
    const listRes = await fetch(`${DRIVE_API}/files?q=${q}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (listRes.ok) {
      const data = await listRes.json() as { files: Array<{ id: string }> }
      if (data.files.length > 0) {
        const id = data.files[0].id
        try { localStorage.setItem(FOLDER_KEY, id) } catch { /* ignore */ }
        return id
      }
    }

    // Create folder
    const createRes = await fetch(`${DRIVE_API}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
    })
    if (!createRes.ok) throw new Error(`Drive: erro ao criar pasta (${createRes.status})`)
    const folder = await createRes.json() as { id: string }
    try { localStorage.setItem(FOLDER_KEY, folder.id) } catch { /* ignore */ }
    return folder.id
  }

  private async findFileId(token: string, folderId: string): Promise<string | null> {
    const q = encodeURIComponent(`'${folderId}' in parents and name='${FILENAME}' and trashed=false`)
    const res = await fetch(`${DRIVE_API}/files?q=${q}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { files: Array<{ id: string }> }
    if (data.files.length === 0) return null
    const id = data.files[0].id
    try { localStorage.setItem(FILE_KEY, id) } catch { /* ignore */ }
    return id
  }

  // ── BackupProvider interface ──────────────────────────────────────────────

  async upload(data: Uint8Array, _filename: string): Promise<void> {
    const token    = await this.ensureToken()
    const folderId = await this.ensureFolder(token)
    const content  = new TextDecoder().decode(data)
    const fileId   = this.storedFileId

    if (fileId) {
      // Update existing file (PATCH — no parents field)
      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify({ name: FILENAME })], { type: 'application/json' }))
      form.append('file',     new Blob([content], { type: 'application/json' }))
      const res = await fetch(`${UPLOAD_API}/files/${fileId}?uploadType=multipart`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error(`Drive: erro ao atualizar arquivo (${res.status})`)
    } else {
      // Create new file
      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify({ name: FILENAME, parents: [folderId] })], { type: 'application/json' }))
      form.append('file',     new Blob([content], { type: 'application/json' }))
      const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error(`Drive: erro ao criar arquivo (${res.status})`)
      const file = await res.json() as { id: string }
      try { localStorage.setItem(FILE_KEY, file.id) } catch { /* ignore */ }
    }
  }

  async download(_filename: string): Promise<Uint8Array | null> {
    const token    = await this.ensureToken()
    const folderId = await this.ensureFolder(token)
    const fileId   = this.storedFileId ?? await this.findFileId(token, folderId)
    if (!fileId) return null

    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const text = await res.text()
    return new TextEncoder().encode(text)
  }

  async getMetadata(_filename: string): Promise<{ lastModified: Date } | null> {
    const token    = await this.ensureToken()
    const folderId = await this.ensureFolder(token)
    const fileId   = this.storedFileId ?? await this.findFileId(token, folderId)
    if (!fileId) return null

    const res = await fetch(`${DRIVE_API}/files/${fileId}?fields=modifiedTime`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { modifiedTime: string }
    return { lastModified: new Date(data.modifiedTime) }
  }
}

export const googleDriveProvider = new GoogleDriveProvider()
