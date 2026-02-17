import pool from '~~/api/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { media_type, media_url } = body
    if (!media_type || !media_url) {
        throw new Error('Missing media_type or media_url')
    }

    // Insert media record into database
    await pool.query(
      'INSERT INTO navigation_system.media_resource (media_type, media_url) VALUES (?, ?)',
      [media_type, media_url]
    )
    return { success: true, message: 'Media uploaded successfully' }
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
    }
})
