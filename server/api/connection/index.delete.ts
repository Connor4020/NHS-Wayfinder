import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { node_1, node_2 } = body || {}

  if (typeof node_1 !== 'number' || typeof node_2 !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'node_1 and node_2 numeric IDs are required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM navigation_system.connections WHERE node_1 = ? AND node_2 = ? LIMIT 1',
      [node_1, node_2]
    )

    const exists = (rows as any[]).length > 0
    if (!exists) {
      throw createError({ statusCode: 404, statusMessage: 'Connection not found' })
    }

    const [result] = await pool.query(
      'DELETE FROM navigation_system.connections WHERE node_1 = ? AND node_2 = ? LIMIT 1',
      [node_1, node_2]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete connection' })
    }

    return { success: true, node_1, node_2 }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('FOREIGN KEY') || msg.includes('constraint')) {
      throw createError({ statusCode: 409, statusMessage: 'Cannot delete connection: referenced by other records' })
    }
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
