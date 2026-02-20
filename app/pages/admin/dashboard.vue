<script setup lang="ts">
import { onMounted } from 'vue'
import useAuth from '../../../server/api/use-auth'
import "../public/css/dashboard.css"

const { user, fetchUserData, logout, error } = useAuth()

onMounted(async () => {
  try {
    await fetchUserData()
  } catch (err) {
    console.error('Error fetching user data:', err)
    logout()
  }
})

const showLogoutSuccess = ref(false);
const logoutMessage = ref("");

async function handleLogout() {
  try {
    await logout();
  } catch (_) {}


  logoutMessage.value = user.value
    ? `Goodbye ${user.value.username}! You have been logged out.`
    : "Logout successful.";
  showLogoutSuccess.value = true;

  setTimeout(() => {
    showLogoutSuccess.value = false;
    try {
      router.push("/");
    } catch (_) {}
  }, 2000);
}
</script>

<template>
  <main>
    <h1>Dashboard</h1>

    <h2 v-if="user" class="welcome-text">Welcome, {{ user.username }}</h2>
    <h2 v-else class="welcome-text">Welcome, Guest</h2>

    <div class="admin-nav">
      <ul>
        <li><NuxtLink to="/admin/media">Media</NuxtLink></li>
        <li><NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink></li>
        <li><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></li>
        <li><NuxtLink to="/admin/node">Add Node</NuxtLink></li>
        <li><NuxtLink to="/admin/connections">Connections</NuxtLink></li>
        <li><NuxtLink to="/admin/users">Users</NuxtLink></li>
      </ul>
    </div>
  </main>
</template>