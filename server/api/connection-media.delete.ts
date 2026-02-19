import { readBody, createError } from 'h3'
import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const { connection_node_1, connection_node_2, media_id } = body || {}

	if (typeof connection_node_1 !== 'number' || typeof connection_node_2 !== 'number' || typeof media_id !== 'number') {
		throw createError({ statusCode: 400, statusMessage: 'connection_node_1, connection_node_2 and media_id must be numeric IDs' })
	}

	try {
		const [rows]: any = await pool.query(
			'SELECT * FROM navigation_system.connection_media WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ? LIMIT 1',
			[connection_node_1, connection_node_2, media_id]
		)
		if (!rows || rows.length === 0) {
			throw createError({ statusCode: 404, statusMessage: 'Connection media not found' })
		}

		const [result]: any = await pool.query(
			'DELETE FROM navigation_system.connection_media WHERE connection_node_1 = ? AND connection_node_2 = ? AND media_id = ? LIMIT 1',
			[connection_node_1, connection_node_2, media_id]
		)

		const affected = result?.affectedRows || 0
		if (affected === 0) {
			throw createError({ statusCode: 500, statusMessage: 'Failed to delete connection media' })
		}

		return { success: true }
	} catch (err: any) {
		const msg = String(err?.message || err)
		throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
	}
})

