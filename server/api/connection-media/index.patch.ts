import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    connection_node_1,
    connection_node_2,
    media_id,
    order_num,
    content_desc
  } = body || {}

  if (typeof connection_node_1 !== 'number' || typeof connection_node_2 !== 'number' || typeof media_id !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'connection_node_1, connection_node_2 and media_id must be numeric IDs' })
  }

  const updates: string[] = []
  const params: any[] = []

  if (Object.prototype.hasOwnProperty.call(body || {}, 'order_num')) {
    if (order_num !== null && (!Number.isInteger(order_num) || order_num < 1)) {
      throw createError({ statusCode: 400, statusMessage: 'order_num must be a positive integer or null' })
    }
    updates.push('order_num = ?')
    params.push(order_num)
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, 'content_desc')) {
    if (content_desc !== null && typeof content_desc !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'content_desc must be a string or null' })
    }
    updates.push('content_desc = ?')
    params.push(content_desc)
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update. Provide order_num and/or content_desc.' })
  }

  try {
    const [existing]: any = await pool.query(
      'SELECT 1 FROM connection_media WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ? LIMIT 1',
      [connection_node_1, connection_node_2, media_id]
    )

    if (!existing || existing.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Connection media not found' })
    }

    params.push(connection_node_1, connection_node_2, media_id)
    const [result]: any = await pool.query(
      `UPDATE connection_media
       SET ${updates.join(', ')}
       WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ?
       LIMIT 1`,
      params
    )

    if (!result || result.affectedRows === 0) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update connection media' })
    }

    return { success: true }
  } catch (err: any) {
    const msg = String(err?.message || err)
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
})
