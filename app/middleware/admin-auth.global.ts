export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  try {
    const requestFetch = process.server ? useRequestFetch() : $fetch
    const res: any = await requestFetch('/api/auth/current-user')
    const currentUser = res?.user ?? null

    if (!currentUser) {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})
