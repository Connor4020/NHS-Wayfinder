<script>
import Header from "./components/header.vue";

export default {
  components: {
    Header,
  },
};
</script>

<script setup>
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






console.log('Current user:', user.value)

</script>



<template>
  <Header/>
  <NuxtPage />
</template>