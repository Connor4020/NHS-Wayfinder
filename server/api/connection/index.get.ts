import { createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async () => {
  try {
    // Join connections with connection_media and media_resource to get all media for each connection in one query
    const [rows] = await pool.query(
            `SELECT c.node_1, c.node_2, c.wheelchair_accessible,
              cm.media_id, mr.media_type, mr.media_url, cm.order_num, cm.content_desc
       FROM navigation_system.connections c
       LEFT JOIN navigation_system.connection_media cm
         ON cm.connection_node_1 = c.node_1 AND cm.connection_node_2 = c.node_2
       LEFT JOIN navigation_system.media_resource mr
         ON mr.media_id = cm.media_id
       ORDER BY c.node_1, c.node_2, cm.order_num ASC`
    )
 
    // rows may contain multiple rows per connection (one per media). Group them.
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
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
