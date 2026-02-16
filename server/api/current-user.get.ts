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

    

    const row: any = await new Promise((resolve, reject) => {
      pool.get('SELECT User_ID, First_Name, Last_Name, Email, Phone, Role FROM User WHERE User_ID = ?', [uid], (err, row) => {
        pool.close()
        if (err) return reject(err)
        resolve(row)
      })
    })

    if (!row) return { user: null }
    return { user: row }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
