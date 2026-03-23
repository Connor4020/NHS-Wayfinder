import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) || {}
    const { media_id, media_name } = body

    if (typeof media_id !== 'number' || !media_name) {
      throw createError({ statusCode: 400, statusMessage: 'media_id (number) and media_name are required' })
    }

    // Try update; if column missing, attempt to add it and retry
    try {
      const [result]: any = await pool.query(
        'UPDATE darks_db.media_resource SET media_name = ? WHERE media_id = ?',
        [String(media_name).trim(), media_id]
      )
      const affected = result?.affectedRows || 0
      if (affected === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Media not found' })
      }
      return { success: true }
    } catch (err: any) {
      const msg = String(err?.message || err)
      // If unknown column, create column safely and retry
      if (msg.toLowerCase().includes('unknown column') || msg.toLowerCase().includes('1054')) {
        // Check information_schema to avoid SQL syntax unsupported keywords
        const [cols]: any = await pool.query(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'media_resource' AND COLUMN_NAME = 'media_name'"
        )
        if (!cols || cols.length === 0) {
          // Add column (no IF NOT EXISTS to maximize compatibility)
          await pool.query('ALTER TABLE darks_db.media_resource ADD COLUMN media_name VARCHAR(255) NULL')
        }

        const [result2]: any = await pool.query(
          'UPDATE darks_db.media_resource SET media_name = ? WHERE media_id = ?',
          [String(media_name).trim(), media_id]
        )
        const affected2 = result2?.affectedRows || 0
        if (affected2 === 0) {
          throw createError({ statusCode: 404, statusMessage: 'Media not found after adding column' })
        }
        return { success: true }
      }
      throw err
    }
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err?.message || err) })
  }
})
