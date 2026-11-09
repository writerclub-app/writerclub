# CLAUDE.md — AI Assistant Guide

This file tells AI assistants everything they need to know to work in this codebase without asking redundant questions.

---

## Stack (quick reference)

| Concern | Technology |
|---|---|
| Framework | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS + awake-ui |
| Editor | Tiptap v2 |
| Local DB | Dexie.js (IndexedDB) |
| Routing | React Router v7 |
| Cache/Query | TanStack Query |
| Global State | Zustand (backup provider only) |
| i18n | react-i18next — PT · EN · ES · IT |
| PWA | vite-plugin-pwa |
| Compression | fflate (gzip backup JSON) |
| Backup | BYOS — Google Drive / OneDrive / GitHub Gist |
| Public DB | Cloudflare D1 (SQLite serverless) |
| AI | Cloudflare Workers AI — Llama 3.1 8B |
| Deploy | Cloudflare Pages |

---

## Mandatory Architecture

```
UI (components)   → renders only, no business logic
      ↓
Hooks             → orchestrates state and side effects
      ↓
Services          → business logic and transformations
      ↓
DB (Dexie / CF Worker) → data access
```

**Rules:**
- Components receive props and render — nothing else.
- Hooks call services and return state/handlers.
- Services contain all business logic and never import React.
- DB layer (Dexie) is accessed only through services.
- No repository pattern — services talk directly to Dexie.

---

## TypeScript

- **Strict mode** is on. No `any`. No type assertions without a comment explaining why.
- Path alias: `@/` → `src/`
- One interface/type per file in `src/types/<module>.ts`
- Discriminated unions for variants (e.g. `BackupProvider` name field)

### Key types

```ts
// Writing (IndexedDB)
interface Writing {
  id: string               // UUID
  title: string
  content: string          // Tiptap JSON as string
  categoryId: string
  categoryName: string     // denormalized for public sync
  folderId?: string
  slug: string             // generated from title
  isPublic: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
}

// BackupProvider interface
interface BackupProvider {
  name: 'google-drive' | 'onedrive' | 'github-gist'
  label: string
  isAuthenticated(): boolean
  authenticate(): Promise<void>
  upload(data: Uint8Array, filename: string): Promise<void>
  download(filename: string): Promise<Uint8Array | null>
  getMetadata(filename: string): Promise<{ lastModified: Date } | null>
}
```

---

## Code Rules

1. **Dumb components** — receive props, render only. No `useEffect` for data fetching inside components.
2. **Hooks** — file name matches `use<Feature>.ts`. Always return a plain object `{ ... }`.
3. **Services** — pure functions, no React imports. `async` functions return typed results.
4. **No prop drilling** — use Zustand or React Context for state shared across 2+ levels.
5. **Offline-first** — IndexedDB (Dexie) is always the source of truth; Cloudflare D1 is only for public read.
6. **i18n** — never hardcode user-facing strings. Use `useTranslation()` hook and keys from `src/locales/`.
7. **Slugify** — always use `src/utils/slugify.ts` to generate slugs (never inline).
8. **Debounce** — BYOS sync is debounced 5 minutes after every write/update/delete.

---

## i18n Rules

- Locale files: `src/locales/{pt,en,es,it}/translation.json`
- Default language: `pt`
- Key format: `snake_case` grouped by feature, e.g. `editor.toolbar.bold`
- When adding a new string, add the key to **all 4 locale files** (use the Portuguese value as a placeholder for missing translations).

---

## DB Schema

### IndexedDB (Dexie) — local source of truth

```
writings       id, title, content, categoryId, categoryName, folderId, slug, isPublic, authorId, createdAt, updatedAt
folders        id, name, authorId, isPublic, createdAt, updatedAt
categories     id, name, authorId, createdAt, updatedAt
profile        id, username, displayName, bio, avatarUrl, backupProvider, createdAt, updatedAt
```

### Cloudflare D1 — public texts only

```sql
CREATE TABLE texts (
  id           TEXT PRIMARY KEY,
  author_id    TEXT NOT NULL,
  username     TEXT NOT NULL,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  category_name TEXT,
  is_public    INTEGER DEFAULT 0,
  created_at   TEXT,
  updated_at   TEXT
);
```

Category is **denormalized** as `category_name` string — no FK join needed for public read.

---

## Routes

| Route | Protection | Notes |
|---|---|---|
| `/login` | Public | OAuth PKCE only |
| `/` | Protected | Home — writings list |
| `/writings/new` | Protected | Mobile: full page; Desktop: modal |
| `/writings/:id` | Protected | View / edit |
| `/folders/:id` | Protected | Writings inside a folder |
| `/profile` | Protected | Settings + backup + categories |
| `/u/:username` | Public | Public profile |
| `/u/:username/:slug` | Public | Individual public text |

---

## BYOS — Bring Your Own Storage

Login IS the backup provider. No email/password. OAuth PKCE flows run entirely in the browser.

| Provider | OAuth Flow | Storage |
|---|---|---|
| Google Drive | Google OAuth PKCE | App folder in Drive |
| OneDrive | Microsoft OAuth PKCE | App folder in OneDrive |
| GitHub | GitHub OAuth PKCE | Private Gist |

**Backup file:** `writings.json.gz` — all writings + folders + categories gzipped with fflate.

**Sync logic (hook `useSyncBackup`):**
1. On every write/update/delete, trigger a 5-minute debounce.
2. On app open, compare `lastModified` from provider with local `updatedAt`.
3. If provider is newer → download, decompress, merge into Dexie.
4. Upload = compress all data → upload to provider.

---

## AI — Cloudflare Workers AI

- Worker path: `workers/ai-worker.ts`
- Model: `@cf/meta/llama-3.1-8b-instruct`
- Streaming: `text/event-stream`
- Free tier: 10,000 requests/day

**Available commands:** `complete`, `suggest-rhyme`, `rewrite`, `suggest-title`, `suggest-slug`

The AI prompt is built by `buildPrompt(command, context, selection)` in `workers/lib/prompts.ts`.

---

## Useful Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Preview build
npm run preview

# Deploy Workers (from workers/ directory)
wrangler deploy

# D1 migrations
wrangler d1 migrations apply writerclub-db
```

---

## What to Update in This File

Update this file when:
- A new dependency is added to the stack
- A new route is created
- The DB schema changes (IndexedDB or D1)
- A new BYOS provider is added
- The AI worker command list changes
- A new global code rule is established
