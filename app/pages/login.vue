<script setup>
import { ref } from 'vue'
import useAuth from '../../server/api/use-auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const message = ref('')

const { fetchUserData } = useAuth()

const loginUser = async () => {
  message.value = ''
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })

    if (!res.ok) {
      message.value = 'Login failed: wrong credentials or server error.'
      return
    }

    const data = await res.json()
    try { await fetchUserData() } catch (_) {}
    message.value = 'Login successful!'
    router.push('/admin/admin-pages')
  } catch (err) {
    message.value = 'Login failed: wrong credentials or server error.'
  }
}
</script>

<template>
  <div>
    <h1>Login Page</h1>

    <form @submit.prevent="loginUser()">
      <div>
        <label for="username">Username:</label>
        <input v-model="username" type="text" id="username" name="username" required />
      </div>


      <div>
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" name="password" required />
      </div>

      <button type="submit">Login</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>
