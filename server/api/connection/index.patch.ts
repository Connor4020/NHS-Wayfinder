import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { node_1, node_2, wheelchair_accessible } = body || {}

  if (typeof node_1 !== 'number' || typeof node_2 !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'node_1 and node_2 numeric IDs are required' })
  }

  if (typeof wheelchair_accessible !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'wheelchair_accessible must be a boolean' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM connections WHERE node_1 = ? AND node_2 = ? LIMIT 1',
      [node_1, node_2]
    )

    const exists = (rows as any[]).length > 0
    if (!exists) {
      throw createError({ statusCode: 404, statusMessage: 'Connection not found' })
    }

    const [result] = await pool.query(
      'UPDATE connections SET wheelchair_accessible = ? WHERE node_1 = ? AND node_2 = ? LIMIT 1',
      [wheelchair_accessible ? 1 : 0, node_1, node_2]
    )

    const affected = (result as any).affectedRows || 0
    if (affected === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update connection' })
    }

    return { success: true, node_1, node_2, wheelchair_accessible }
  } catch (err: any) {
    const msg = String(err?.message || err)
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
