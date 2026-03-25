import { createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const wantsPaging = query.limit !== undefined || query.offset !== undefined

    if (!wantsPaging) {
      const [rows] = await pool.query(
        `SELECT c.node_1, c.node_2, c.wheelchair_accessible,
                cm.media_id, mr.media_type, mr.media_url, cm.order_num, cm.content_desc
         FROM connections c
         LEFT JOIN connection_media cm
           ON cm.connection_node_1 = c.node_1 AND cm.connection_node_2 = c.node_2
         LEFT JOIN media_resource mr
           ON mr.media_id = cm.media_id
         ORDER BY c.node_1, c.node_2, cm.order_num ASC`
      )

      const map = new Map()
      for (const r of rows as any[]) {
        const key = `${r.node_1}-${r.node_2}`
        if (!map.has(key)) {
          map.set(key, {
            node_1: r.node_1,
            node_2: r.node_2,
            wheelchair_accessible: !!r.wheelchair_accessible,
            media: []
          })
        }
        if (r.media_id != null) {
          map.get(key).media.push({ media_id: r.media_id, media_type: r.media_type, media_url: r.media_url, order_num: r.order_num, content_desc: r.content_desc })
        }
      }

      return Array.from(map.values())
    }

    const parsedLimit = Number(query.limit ?? 50)
    const parsedOffset = Number(query.offset ?? 0)
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(1, parsedLimit), 100) : 50
    const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM connections')
    const total = Number((countRows as any[])[0]?.total || 0)

    const [pagedConnections] = await pool.query(
      'SELECT node_1, node_2, wheelchair_accessible FROM connections ORDER BY node_1, node_2 LIMIT ? OFFSET ?',
      [limit, offset]
    )

    const baseList = pagedConnections as any[]
    const map = new Map<string, any>()
    for (const conn of baseList) {
      const key = `${conn.node_1}-${conn.node_2}`
      map.set(key, {
        node_1: conn.node_1,
        node_2: conn.node_2,
        wheelchair_accessible: !!conn.wheelchair_accessible,
        media: []
      })
    }

    if (baseList.length > 0) {
      const whereClause = baseList.map(() => '(cm.connection_node_1 = ? AND cm.connection_node_2 = ?)').join(' OR ')
      const params: Array<number> = []
      for (const conn of baseList) {
        params.push(Number(conn.node_1), Number(conn.node_2))
      }

      const [mediaRows] = await pool.query(
        `SELECT cm.connection_node_1 AS node_1, cm.connection_node_2 AS node_2,
                cm.media_id, mr.media_type, mr.media_url, cm.order_num, cm.content_desc
         FROM connection_media cm
         LEFT JOIN media_resource mr ON mr.media_id = cm.media_id
         WHERE ${whereClause}
         ORDER BY cm.connection_node_1, cm.connection_node_2, cm.order_num ASC`,
        params
      )

      for (const row of mediaRows as any[]) {
        const key = `${row.node_1}-${row.node_2}`
        const entry = map.get(key)
        if (!entry) continue
        entry.media.push({
          media_id: row.media_id,
          media_type: row.media_type,
          media_url: row.media_url,
          order_num: row.order_num,
          content_desc: row.content_desc
        })
      }
    }

    return {
      items: Array.from(map.values()),
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
