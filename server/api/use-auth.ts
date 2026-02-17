import { ref } from 'vue'


export const user = ref<{ username: string } | null>(null)
export const loading = ref(false)
export const error = ref<string | null>(null)


export async function fetchUserData() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/current-user')
    if (!res.ok) {
      user.value = null
      return null
    }
    const data = await res.json()
    const u = data?.user ?? null
    user.value = u ? { username: u.username } : null
    return user.value
  } catch (err) {
    user.value = null
    error.value = err instanceof Error ? err.message : String(err)
    return null
  } finally {
    loading.value = false
  }
}

// logout helper: log out user and clear state
export async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' })
  } catch (err) {
  }

  try { localStorage.removeItem('user') } catch (_) {}
  user.value = null
}

export function useAuth() {
  return { user, loading, error, fetchUserData, logout }
}

export default useAuth
