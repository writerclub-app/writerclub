import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

// Mocks
vi.mock('@/services/auth.service', () => ({
  initiateGoogleLogin: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

import { initiateGoogleLogin } from '@/services/auth.service'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders app name and tagline', () => {
    render(<LoginPage />)
    expect(screen.getByText('app.name')).toBeInTheDocument()
    expect(screen.getByText('app.tagline')).toBeInTheDocument()
  })

  it('renders three provider buttons', () => {
    render(<LoginPage />)
    expect(screen.getByText('auth.login.continue_with_google')).toBeInTheDocument()
    expect(screen.getByText('auth.login.continue_with_microsoft')).toBeInTheDocument()
    expect(screen.getByText('auth.login.continue_with_github')).toBeInTheDocument()
  })

  it('Microsoft and GitHub buttons are disabled', () => {
    render(<LoginPage />)
    expect(screen.getByText('auth.login.continue_with_microsoft').closest('button')).toBeDisabled()
    expect(screen.getByText('auth.login.continue_with_github').closest('button')).toBeDisabled()
  })

  it('calls initiateGoogleLogin when Google button is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.click(screen.getByText('auth.login.continue_with_google'))
    expect(initiateGoogleLogin).toHaveBeenCalledOnce()
  })

  it('renders local storage notice', () => {
    render(<LoginPage />)
    expect(screen.getByText('auth.login.local_storage_notice')).toBeInTheDocument()
  })
})
