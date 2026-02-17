import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username } = body || {}

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username is required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM navigation_system.users WHERE username = ?',
      [username]
    )

    const row = (rows as any[])[0]
    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const [result] = await pool.query(
      'DELETE FROM navigation_system.users WHERE username = ?',
      [username]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete user' })
    }

    return { success: true, username }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('FOREIGN KEY') || msg.includes('constraint')) {
      throw createError({ statusCode: 409, statusMessage: 'Cannot delete user: referenced by other records' })
    }
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
