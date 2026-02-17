
<script setup lang="ts">
import { onMounted } from 'vue'
import useAuth from '../server/api/use-auth'

const { user, fetchUserData, logout, error } = useAuth()

onMounted(async () => {
  try {
    await fetchUserData()
  } catch (err) {
    console.error('Error fetching user data:', err)
    logout()
  }
})

console.log('Current user:', user.value)
</script>

<template>
  <h3>Welcome to NHS Wayfinder</h3>

  <h1 v-if="user">welcome {{ user.username }}</h1>
  <h1 v-else>welcome Guest</h1>

  <NuxtPage />
</template>