import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthCallbackPage } from './AuthCallbackPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/auth.service', () => ({
  handleGoogleCallback: vi.fn(),
  saveToken: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: { profile: { get: vi.fn() } },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { handleGoogleCallback, saveToken } from '@/services/auth.service'
import { db } from '@/db'

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signing in text', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback?code=abc']}>
        <AuthCallbackPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('auth.callback.signing_in')).toBeInTheDocument()
  })

  it('redirects to /login when no code in URL', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthCallbackPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('redirects to /onboarding when profile does not exist', async () => {
    vi.mocked(handleGoogleCallback).mockResolvedValue({
      accessToken: 'token',
      expiresAt: Date.now() + 3600000,
      provider: 'google',
      authId: 'auth-123',
      email: 'test@test.com',
      displayName: 'Test User',
    })
    vi.mocked(db.profile.get).mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/auth/callback?code=abc']}>
        <AuthCallbackPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/onboarding'))
    expect(saveToken).toHaveBeenCalled()
  })

  it('redirects to / when profile already exists', async () => {
    vi.mocked(handleGoogleCallback).mockResolvedValue({
      accessToken: 'token',
      expiresAt: Date.now() + 3600000,
      provider: 'google',
      authId: 'auth-123',
      email: 'test@test.com',
      displayName: 'Test User',
    })
    vi.mocked(db.profile.get).mockResolvedValue({
      id: 'auth-123',
      username: 'nil',
      displayName: 'Test User',
      email: 'test@test.com',
      oauthProvider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    render(
      <MemoryRouter initialEntries={['/auth/callback?code=abc']}>
        <AuthCallbackPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })
})
