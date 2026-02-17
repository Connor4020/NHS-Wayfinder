import { readBody, createError, setCookie } from 'h3'
import pool from '../../api/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}
  // accept common password field names (case-insensitive)
  const { username } = body
  const password = body.password ?? body.Password ?? body.password_hash ?? body.Password_hash

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'username and password are required' })
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM navigation_system.users WHERE username = ?', [username])
    const row = rows?.[0]

    if (!row) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
    }

    // support different password column names
    const storedHash = row.password_hash ?? row.Password ?? row.password
    if (!storedHash) {
      throw createError({ statusCode: 500, statusMessage: 'User has no password set' })
    }

    const match = await bcrypt.compare(String(password), String(storedHash))
    if (!match) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
    }

    const safeUser = { ...row }
    delete safeUser.Password
    delete safeUser.password
    delete safeUser.password_hash

    const token = jwt.sign({ uid: row.User_ID ?? row.id ?? row.UserID ?? row.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS })

    setCookie(event, 'auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/index.vue',
      maxAge: JWT_EXPIRES_IN_SECONDS,
      secure: process.env.NODE_ENV === 'production'
    })

    return { success: true, user: safeUser, Role: row.Role || 'User' }
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err?.message || err) })
  }
})
