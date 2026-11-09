export type BackupProviderName = 'google-drive' | 'onedrive' | 'github-gist'

export type OAuthProvider = 'google' | 'microsoft' | 'github'

// Stored locally in Dexie (full profile)
export interface Profile {
  id: string              // authId from OAuth — primary key, never in URLs
  username: string        // public handle → /u/:username
  displayName: string
  email: string           // local only, never sent to D1
  bio?: string
  avatarUrl?: string
  oauthProvider: OAuthProvider
  backupProvider?: BackupProviderName
  createdAt: Date
  updatedAt: Date
}

// Sent to / received from Cloudflare D1
export interface PublicProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
  oauthProvider: OAuthProvider
  createdAt: string
  updatedAt: string
}

export type ProfileCreate = Omit<Profile, 'createdAt' | 'updatedAt'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'createdAt'>> & { updatedAt: Date }
