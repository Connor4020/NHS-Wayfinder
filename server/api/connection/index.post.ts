import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { node_1, node_2, wheelchair_accessible = false } = body
    if (typeof node_1 !== 'number' || typeof node_2 !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'node_1 and node_2 must be numeric IDs' })
    }

    await pool.execute(
      'INSERT INTO navigation_system.connections (node_1, node_2, wheelchair_accessible) VALUES (?, ?, ?)',
      [node_1, node_2, wheelchair_accessible ? 1 : 0]
    )

    return { success: true }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('Duplicate') || msg.includes('ER_DUP_ENTRY')) {
      throw createError({ statusCode: 409, statusMessage: 'Connection already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
