import pool from '~~/api/database'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    let { media_type, media_url } = body
    if (!media_type || !media_url) {
      throw new Error('Missing media_type or media_url')
    }

    // If client sent a data URL (base64), save it to `public/media` and replace media_url
    if (typeof media_url === 'string' && media_url.startsWith('data:')) {
      const match = media_url.match(/^data:(image\/[a-zA-Z0-9.+-]+|video\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
      if (!match) throw new Error('Unsupported data URL format')

      const mime = match[1]
      const base64Data = match[2]
      const ext = mime.split('/')[1] || 'bin'
      const fileName = `media-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const outPath = path.join(process.cwd(), 'public', 'media', fileName)

      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))

      // store short relative URL so it fits typical VARCHAR(255)
      media_url = `/media/${fileName}`
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
