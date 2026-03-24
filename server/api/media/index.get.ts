import { createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const wantsPaging = query.limit !== undefined || query.offset !== undefined

    if (!wantsPaging) {
      const [rows] = await pool.query('SELECT * FROM media_resource')
      return rows
    }

    const parsedLimit = Number(query.limit ?? 50)
    const parsedOffset = Number(query.offset ?? 0)
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(1, parsedLimit), 100) : 50
    const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM media_resource')
    const total = Number((countRows as any[])[0]?.total || 0)

    const [rows] = await pool.query(
      'SELECT * FROM media_resource ORDER BY media_id LIMIT ? OFFSET ?',
      [limit, offset]
    )
    return {
      items: rows,
      total,
      limit,
      offset,
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
