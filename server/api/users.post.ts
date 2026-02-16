import pool from '../../api/database';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}
  const { username, password_hash } = body


  if (!username || !password_hash) {
    throw createError({ statusCode: 400, statusMessage: 'username and password are required' })
  }

  try {
    // hash password before storing
    const hashedPassword = await bcrypt.hash(String(password_hash), 10)

    // Insert into the same table used by the GET handler
    const columnName = password_hash ? 'password_hash' : 'password'
    const sql = `INSERT INTO navigation_system.users (username, password_hash) VALUES (?, ?)`
    const [result]: any = await pool.execute(sql, [username, hashedPassword])

    return { id: result.insertId ?? result.insert_id ?? null, username }
  } catch (err: any) {
    const msg = String(err?.message || err)
    if (msg.includes('UNIQUE') || msg.includes('constraint')) {
      throw createError({ statusCode: 409, statusMessage: msg })
    }
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
