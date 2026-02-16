import { ref } from 'vue'


export const user = ref<any | null>(null)
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
    user.value = data?.user ?? null
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
