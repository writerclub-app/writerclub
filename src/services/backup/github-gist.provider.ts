import type { BackupProvider } from '@/types/backup'

const TOKEN_KEY = 'byos_github_pat'
const GIST_ID_KEY = 'byos_github_gist_id'
const FILENAME = 'writerclub-backup.json'
const API = 'https://api.github.com'

export class GitHubGistProvider implements BackupProvider {
  readonly name = 'github-gist' as const
  readonly label = 'GitHub Gist'

  private get pat(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  }

  private get storedGistId(): string | null {
    try { return localStorage.getItem(GIST_ID_KEY) } catch { return null }
  }

  private setGistId(id: string): void {
    try { localStorage.setItem(GIST_ID_KEY, id) } catch { /* ignore */ }
  }

  isAuthenticated(): boolean {
    return !!this.pat
  }

  async authenticate(): Promise<void> {
    return Promise.resolve()
  }

  setToken(pat: string): void {
    try { localStorage.setItem(TOKEN_KEY, pat) } catch { /* ignore */ }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(GIST_ID_KEY)
    } catch { /* ignore */ }
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.pat ?? ''}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
  }

  async upload(data: Uint8Array, _filename: string): Promise<void> {
    const content = new TextDecoder().decode(data)
    const body = JSON.stringify({
      description: 'WriterClub backup (auto-generated)',
      public: false,
      files: { [FILENAME]: { content } },
    })

    if (this.storedGistId) {
      const res = await fetch(`${API}/gists/${this.storedGistId}`, {
        method: 'PATCH',
        headers: this.headers(),
        body,
      })
      if (!res.ok) throw new Error(`GitHub Gist update failed: ${res.status}`)
    } else {
      const res = await fetch(`${API}/gists`, {
        method: 'POST',
        headers: this.headers(),
        body,
      })
      if (!res.ok) throw new Error(`GitHub Gist create failed: ${res.status}`)
      const json = await res.json() as { id: string }
      this.setGistId(json.id)
    }
  }

  /** Procura entre os Gists do usuário qual contém writerclub-backup.json */
  private async findGistId(): Promise<string | null> {
    let page = 1
    while (page <= 10) {
      const res = await fetch(`${API}/gists?per_page=100&page=${page}`, { headers: this.headers() })
      if (!res.ok) return null
      const list = await res.json() as Array<{ id: string; files: Record<string, unknown> }>
      if (list.length === 0) return null
      const found = list.find(g => FILENAME in g.files)
      if (found) {
        this.setGistId(found.id)
        return found.id
      }
      if (list.length < 100) return null
      page++
    }
    return null
  }

  async download(_filename: string): Promise<Uint8Array | null> {
    const gistId = this.storedGistId ?? await this.findGistId()
    if (!gistId) return null
    const res = await fetch(`${API}/gists/${gistId}`, { headers: this.headers() })
    if (!res.ok) return null
    const json = await res.json() as { files: Record<string, { content: string }> }
    const file = json.files[FILENAME]
    if (!file) return null
    return new TextEncoder().encode(file.content)
  }

  async getMetadata(_filename: string): Promise<{ lastModified: Date } | null> {
    if (!this.storedGistId) return null
    const res = await fetch(`${API}/gists/${this.storedGistId}`, { headers: this.headers() })
    if (!res.ok) return null
    const json = await res.json() as { updated_at: string }
    return { lastModified: new Date(json.updated_at) }
  }

  async validateToken(pat: string): Promise<string> {
    const res = await fetch(`${API}/user`, {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (!res.ok) throw new Error('Token inválido ou sem permissão de Gist')
    const json = await res.json() as { login: string }
    return json.login
  }
}

export const githubGistProvider = new GitHubGistProvider()
