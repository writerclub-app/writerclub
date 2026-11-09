# WriterClub

A PWA for creative writing — poems, songs, short stories, and more.

## About

WriterClub is an offline-first creative writing app with rich text support, folder and category organization, BYOS (Bring Your Own Storage) backup, and an AI writing assistant.

## Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS + awake-ui |
| Editor | Tiptap v2 |
| Local DB | Dexie.js (IndexedDB) |
| Routing | React Router v7 |
| Cache/Query | TanStack Query (React Query) |
| Global State | Zustand |
| i18n | react-i18next (PT · EN · ES · IT) |
| PWA | vite-plugin-pwa |
| Backup | BYOS — Google Drive / OneDrive / GitHub Gist |
| Public DB | Cloudflare D1 |
| AI | Cloudflare Workers AI — Llama 3.1 8B |
| Deploy | Cloudflare Pages |

## Features

- ✍️ Rich text editor (bold, italic, alignment, font size, etc.)
- 📁 Folder and category organization
- 🌐 Public profile with shareable texts via URL (`/u/:username/:slug`)
- 🔒 Privacy per text and folder (public / private)
- 🤖 AI assistant: complete text, suggest rhymes, rewrite, suggest title
- 🌍 i18n: Português, English, Español, Italiano
- 📱 Installable PWA on mobile and desktop
- 🔄 Cross-device sync via BYOS backup
- 🔑 Login via Google, Microsoft or GitHub (no email/password)

## Architecture

```
UI (components)   → renders only, no business logic
      ↓
Hooks             → orchestrates state and side effects
      ↓
Services          → business logic and transformations
      ↓
DB (Dexie / CF Worker) → data access
```

## Folder Structure

```
src/
├── components/      # UI components (dumb, props only)
│   ├── editor/      # Tiptap + Toolbar
│   ├── layout/      # Navbar, Header
│   ├── writing/     # WritingCard, WritingList, WritingForm
│   ├── folder/      # FolderTree, FolderItem
│   └── backup/      # BackupProvider, BackupStatus
├── hooks/           # Orchestration hooks
├── services/        # Business logic
├── db/              # Dexie schema + IndexedDB access
├── types/           # TypeScript interfaces per module
├── utils/           # Pure functions (slugify, formatDate, etc.)
├── store/           # Zustand (global UI state)
├── routes/          # Pages / routes
└── locales/         # Translation files (pt, en, es, it)
workers/             # Cloudflare Workers (AI + public D1)
```

## Routes

| Route | Description |
|---|---|
| `/login` | OAuth login (Google, Microsoft, GitHub) |
| `/` | Home — writings list (All / Folders tabs) |
| `/writings/new` | Create writing (mobile: full screen) |
| `/writings/:id` | View / edit writing |
| `/folders/:id` | Writings inside a folder |
| `/profile` | Settings, backup, categories |
| `/u/:username` | Public profile of a user |
| `/u/:username/:slug` | Individual public text |

## Getting Started

```bash
# Install dependencies
# Run in: writerclub/
npm install

# Start dev server
# Run in: writerclub/
npm run dev

# Production build
# Run in: writerclub/
npm run build
```

## Principles

- **SOLID + Clean Code** — one responsibility per file
- **Dumb components** — receive props, render only
- **TypeScript strict** — no `any`
- **No prop drilling** — use Zustand or Context for cross-cutting state
- **Offline-first** — IndexedDB as source of truth
