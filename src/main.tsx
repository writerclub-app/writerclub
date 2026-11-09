import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toast } from '@awakr/awake-ui/toast'
import './i18n'
import App from './App'
import './index.css'
import '@awakr/awake-ui/style.css'
import '@awakr/awake-ui/dark-theme.css'
import './palettes.css'   // ← DEPOIS do awake-ui para sobrescrever tokens de dark

// Apply theme and palette before React mounts (evita flash)
const savedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = savedTheme ?? (prefersDark ? 'dark' : 'light')
document.documentElement.setAttribute('data-theme', theme)

const savedPalette = localStorage.getItem('palette') ?? 'modern'
document.documentElement.setAttribute('data-palette', savedPalette)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>
        <App />
      </Toast.Provider>
    </QueryClientProvider>
  </StrictMode>,
)
