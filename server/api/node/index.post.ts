import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { node_name } = body
    if (!node_name) throw createError({ statusCode: 400, statusMessage: 'node_name is required' })

    const [result]: any = await pool.execute(
      'INSERT INTO navigation_system.node (node_name) VALUES (?)',
      [node_name]
    )

    return { success: true, node_id: result.insertId ?? null }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
