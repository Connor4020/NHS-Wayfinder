import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { media_url } = body || {}

  if (!media_url) {
    throw createError({ statusCode: 400, statusMessage: 'Media URL is required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM navigation_system.media_resource WHERE media_url = ?',
      [media_url]
    )

    const row = (rows as any[])[0]

    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'Media resource not found' })
    }

    // delete the record
    const [result] = await pool.query(
      'DELETE FROM navigation_system.media_resource WHERE media_url = ?',
      [media_url]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete media resource' })
    }

    return { success: true, message: 'Media resource deleted successfully' }
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.message || err) })
  }
})
