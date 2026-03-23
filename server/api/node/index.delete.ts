import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { node_id } = body || {}

  if (typeof node_id !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'node_id numeric ID is required' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM navigation_system.node WHERE node_id = ? LIMIT 1',
      [node_id]
    )

    const exists = (rows as any[]).length > 0
    if (!exists) {
      throw createError({ statusCode: 404, statusMessage: 'Node not found' })
    }

    const [result] = await pool.query(
      'DELETE FROM navigation_system.node WHERE node_id = ? LIMIT 1',
      [node_id]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete node' })
    }

    return { success: true, node_id }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('FOREIGN KEY') || msg.includes('constraint')) {
      throw createError({ statusCode: 409, statusMessage: 'Cannot delete node: referenced by other records' })
    }
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
