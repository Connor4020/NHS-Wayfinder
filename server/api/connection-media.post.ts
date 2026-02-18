import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { connection_node_1, connection_node_2, media_id, order_num = null } = body

    if (typeof connection_node_1 !== 'number' || typeof connection_node_2 !== 'number' || typeof media_id !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'connection_node_1, connection_node_2 and media_id must be numeric IDs' })
    }

    // Verify connection exists
    const [rows]: any = await pool.query(
      'SELECT 1 FROM navigation_system.connections WHERE node_1 = ? AND node_2 = ? LIMIT 1',
      [connection_node_1, connection_node_2]
    )
    if (!rows || rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Connection not found' })
    }

    // verify media exists
    const [mrows]: any = await pool.query('SELECT 1 FROM navigation_system.media_resource WHERE media_id = ? LIMIT 1', [media_id])
    if (!mrows || mrows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    }

    await pool.execute(
      'INSERT INTO navigation_system.connection_media (connection_node_1, connection_node_2, media_id, order_num) VALUES (?, ?, ?, ?)',
      [connection_node_1, connection_node_2, media_id, order_num]
    )

    return { success: true }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('Duplicate') || msg.includes('ER_DUP_ENTRY')) {
      throw createError({ statusCode: 409, statusMessage: 'Media already assigned to this connection' })
    }
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
