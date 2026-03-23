import { readBody, createError } from 'h3'
import pool from '~~/api/database'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { media_url, new_name } = body || {}

    if (!media_url || !new_name) {
      throw createError({ statusCode: 400, statusMessage: 'media_url and new_name are required' })
    }

    // Only allow renaming files saved under /media/
    if (typeof media_url !== 'string' || !media_url.startsWith('/media/')) {
      throw createError({ statusCode: 400, statusMessage: 'Only local /media/ files can be renamed' })
    }

    const mediaDir = path.join(process.cwd(), 'public', 'media')
    const oldFile = path.join(mediaDir, path.basename(media_url))

    if (!fs.existsSync(oldFile)) {
      throw createError({ statusCode: 404, statusMessage: 'Media file not found on disk' })
    }

    // sanitize new name
    const base = path.basename(String(new_name))
    const safeBase = base.replace(/[^a-zA-Z0-9._()-]/g, '_')

    // ensure extension present: if missing, use original extension
    const hasExt = safeBase.includes('.')
    const origExt = path.extname(oldFile) || ''
    let targetName = hasExt ? safeBase : `${safeBase}${origExt}`
    let targetPath = path.join(mediaDir, targetName)

    // avoid overwrite: if exists, append timestamp
    if (fs.existsSync(targetPath)) {
      const parsed = path.parse(targetName)
      targetName = `${parsed.name}-${Date.now()}${parsed.ext}`
      targetPath = path.join(mediaDir, targetName)
    }

    // rename on disk
    fs.renameSync(oldFile, targetPath)

    const newMediaUrl = `/media/${targetName}`

    // update database
    const [result] = await pool.query(
      'UPDATE darks_db.media_resource SET media_url = ? WHERE media_url = ?',
      [newMediaUrl, media_url]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      // attempt to roll back file rename if DB update failed
      try { fs.renameSync(targetPath, oldFile) } catch (e) { /* ignore */ }
      throw createError({ statusCode: 500, statusMessage: 'Failed to update media record' })
    }

    return { success: true, message: 'Media renamed', media_url: newMediaUrl }
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err?.message || err) })
  }
})
