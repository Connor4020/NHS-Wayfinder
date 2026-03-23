import pool from '~~/api/database'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    let { media_type, media_url, file_name } = body
    if (!media_type || !media_url) {
      throw new Error('Missing media_type or media_url')
    }

    // If client sent a data URL (base64), save it to `public/media` and replace media_url
    if (typeof media_url === 'string' && media_url.startsWith('data:')) {
      const match = media_url.match(/^data:(image\/[a-zA-Z0-9.+-]+|video\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
      if (!match) throw new Error('Unsupported data URL format')

      const mime = match[1]
      const base64Data = match[2]
      // determine filename: prefer provided original filename, otherwise generate one
      let fileName = ''
      if (file_name && typeof file_name === 'string') {
        // sanitize incoming filename
        const base = path.basename(file_name)
        // replace unsafe characters and collapse spaces
        const safeBase = base.replace(/[^a-zA-Z0-9._()-]/g, '_')
        // ensure extension matches mime if missing
        const hasExt = safeBase.includes('.')
        const ext = mime.split('/')[1] || 'bin'
        fileName = hasExt ? safeBase : `${safeBase}.${ext}`
      } else {
        const ext = mime.split('/')[1] || 'bin'
        fileName = `media-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      }

      const mediaDir = path.join(process.cwd(), 'public', 'media')
      fs.mkdirSync(mediaDir, { recursive: true })
      let outPath = path.join(mediaDir, fileName)

      // avoid overwriting: if filename exists, append timestamp before extension
      if (fs.existsSync(outPath)) {
        const parsed = path.parse(fileName)
        const uniqueName = `${parsed.name}-${Date.now()}${parsed.ext}`
        fileName = uniqueName
        outPath = path.join(mediaDir, fileName)
      }

      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'))

      // store short relative URL for database
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
