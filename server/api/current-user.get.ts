import { createError, getCookie } from 'h3'
import pool from '~~/api/database'


const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth')
    if (!token) return { user: null }


    const jwtmod = await import('jsonwebtoken')
    const jwt = jwtmod.default ?? jwtmod
    let payload: any

    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return { user: null }
    }

    const uid = payload?.uid
    if (!uid) return { user: null }

    // push to database

    const [rows]: any = await pool.query('SELECT * FROM navigation_system.users WHERE username = ?', [uid])
    const row = rows?.[0]
    

    if (!row) return { user: null }
    return { user: row }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})


// USAGE: 
// const { user } = await $fetch('/api/current-user')
// user will be null if not authenticated, or an object with user data if authenticated.
