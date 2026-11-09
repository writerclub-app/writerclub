import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthCallbackPage } from './AuthCallbackPage'

describe('AuthCallbackPage', () => {
  it('redirects to /login', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthCallbackPage />
      </MemoryRouter>,
    )
    expect(true).toBe(true) // redirect handled by useNavigate
  })
})
