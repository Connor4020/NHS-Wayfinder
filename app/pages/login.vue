<script setup>
import { ref } from 'vue'
import useAuth from '../../server/api/use-auth'
import '../public/css/login.css'



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
    router.push('/admin/dashboard')
  } catch (err) {
    message.value = 'Login failed: wrong credentials or server error.'
  }
}
</script>

<template>


  <main>
    <h1>Log in to your NHS Wayfinder account</h1>
    <form @submit.prevent="loginUser()">
      <div class="form-group">
        <label for="username">Username:</label>
        <input v-model="username" type="text" id="username" name="username" required />
      </div>


      <div class="form-group">
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" name="password" required />
      </div>

      <button type="submit">Login</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </main>

  <footer>
    <ul> 
      <li><a href="..">Services</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>

    <p>&copy; 2026 NHS Wayfinder. All rights reserved.</p>
  </footer>

</template>
