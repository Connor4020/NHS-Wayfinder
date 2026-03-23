import { setCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Clear the auth cookie by setting it with maxAge 0
    setCookie(event, 'auth', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production'
    })

    return { success: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
