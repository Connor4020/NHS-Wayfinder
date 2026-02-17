
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

const showLogoutSuccess = ref(false);
const logoutMessage = ref("");

async function handleLogout() {
  try {
    await logout();
  } catch (_) {}

  try {
    const visor = document.getElementById("hamburgerLinksVisor");
    if (visor) visor.style.display = "none";
  } catch (_) {}

  logoutMessage.value = user.value
    ? `Goodbye ${user.value.First_Name}! You have been logged out.`
    : "Logout successful.";
  showLogoutSuccess.value = true;

  setTimeout(() => {
    showLogoutSuccess.value = false;
    try {
      router.push("/");
    } catch (_) {}
  }, 2000);
}






console.log('Current user:', user.value)

</script>

<template>
  <h3>Welcome to NHS Wayfinder</h3>
  <NuxtLink v-if="!user" to="/login">login</NuxtLink>
          <NuxtLink v-if="user" to="#" @click.prevent="handleLogout">
            Logout
          </NuxtLink>

  <h1 v-if="user">welcome {{ user.username }}</h1>
  <h1 v-else>welcome Guest</h1>
  
  <NuxtPage />
</template>