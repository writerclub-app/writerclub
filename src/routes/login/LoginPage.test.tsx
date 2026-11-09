import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renders login buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/google/i)).toBeTruthy()
    expect(screen.getByText(/microsoft/i)).toBeTruthy()
    expect(screen.getByText(/github/i)).toBeTruthy()
  })
})
