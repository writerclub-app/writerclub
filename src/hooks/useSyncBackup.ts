import { useEffect, useRef } from 'react'
import { fetchMyWritings } from '@/services/api.service'
import { db } from '@/db/schema'
import { slugify } from '@/utils/slugify'

/**
 * Restaura escritas do D1 para o Dexie ao abrir o app.
 * Merge strategy: D1 ganha se updatedAt for mais recente.
 */
export function useSyncBackup(authId: string | null) {
  const ran = useRef(false)

  useEffect(() => {
    if (!authId || ran.current) return
    ran.current = true

    void (async () => {
      try {
        const remote = await fetchMyWritings(authId)
        if (!remote.length) return

        for (const r of remote) {
          const existing = await db.writings.where('id').equals(r.local_id).first()
          const remoteUpdated = new Date(r.updated_at)

          if (!existing || existing.updatedAt < remoteUpdated) {
            let warnings: string[] = []
            try { warnings = JSON.parse(r.content_warnings) as string[] } catch { /* ignore */ }

            await db.writings.put({
              id: r.local_id,
              title: r.title,
              slug: r.slug || slugify(r.title),
              content: r.content,
              categoryId: '',
              categoryName: r.category_name ?? '',
              isPublic: r.is_public === 1,
              authorId: authId,
              contentWarnings: warnings,
              folderId: undefined,
              createdAt: new Date(r.published_at),
              updatedAt: remoteUpdated,
            })
          }
        }
      } catch {
        // silencioso — offline ou token inválido
      }
    })()
  }, [authId])
}
