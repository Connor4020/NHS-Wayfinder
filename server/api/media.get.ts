import pool from '~~/api/database'

export default defineEventHandler(async () => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM navigation_system.media_resource'
    )
    return rows
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})