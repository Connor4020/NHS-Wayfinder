import pool from '../../api/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password_hash } = body || {}

  if (!username || !password_hash ) {
    throw createError({ statusCode: 400, statusMessage: 'username and password are required' })
  }
  
/*
  try {
    // hash password before storing
    const bcryptmod = await import('bcryptjs')
    const bcrypt = bcryptmod.default ?? bcryptmod
    const hashedPassword = await bcrypt.hash(Password, 10)

    const [result]: any = await pool.execute(
      'INSERT INTO User (username, Password) VALUES (?, ?)',
      [username, hashedPassword]
    )

    return { id: result.insertId ?? result.insert_id ?? null, username }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('UNIQUE') || msg.includes('constraint')) {
      throw createError({ statusCode: 409, statusMessage: msg })
    }
    throw createError({ statusCode: 500, statusMessage: msg })
  }
*/
})
