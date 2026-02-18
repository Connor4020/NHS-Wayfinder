<script setup lang="ts">
import { onMounted } from 'vue'
import useAuth from '../../../server/api/use-auth'

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
    <div>
        <h1>dashboard</h1>


        <h1 v-if="user">welcome {{ user.username }}</h1>
        <h1 v-else>welcome Guest</h1>

        <div>
            <div class="admin-nav">
                <ul>
                    <li><NuxtLink to="/admin/create-route">Create Route</NuxtLink></li>
                    <li><NuxtLink to="/admin/create-routemap">Create Route Map</NuxtLink></li>
                    <li><NuxtLink to="/admin/edit-routemap">Edit Route Map</NuxtLink></li>
                    <li><NuxtLink to="/admin/list-locations">List Locations</NuxtLink></li>
                    <li><NuxtLink to="/admin/list-media">List Media</NuxtLink></li>
                    <li><NuxtLink to="/admin/list-routesadmin">List Routes</NuxtLink></li>
                    <li><NuxtLink to="/admin/qr-code">QR Code</NuxtLink></li>
                    <li><NuxtLink to="/admin/review-media">Review Media</NuxtLink></li>
                    <li><NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink></li>
                </ul>
            </div>
        </div>

        
    </div>
</template>