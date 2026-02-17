import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM navigation_system.path'
        )
        return rows
    }   
    catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
    }
})