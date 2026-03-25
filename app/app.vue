<script>
import Header from "./components/header.vue";
import Footer from "./components/footer.vue";

export default {
  components: {
    Header,
  },
};
</script>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import useAuth from '../server/api/use-auth'


const { user, fetchUserData, logout, error } = useAuth()
const globalPreviewImageUrl = ref('')

const closeGlobalPreview = () => {
  globalPreviewImageUrl.value = ''
}

const onMediaPreviewOpen = (event) => {
  const url = event?.detail?.url
  if (!url) return
  globalPreviewImageUrl.value = String(url)
}

const onGlobalPreviewKeydown = (event) => {
  if (event.key === 'Escape') {
    closeGlobalPreview()
  }
}

onMounted(async () => {
  try {
    await fetchUserData()
  } catch (err) {
    console.error('Error fetching user data:', err)
    logout()
  }
})

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('media-preview:open', onMediaPreviewOpen)
  window.addEventListener('keydown', onGlobalPreviewKeydown)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('media-preview:open', onMediaPreviewOpen)
  window.removeEventListener('keydown', onGlobalPreviewKeydown)
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
  <div class="app-layout">
    <Header />
    <div class="app-main">
      <NuxtPage />
    </div>
    <Footer />
  </div>

  <div v-if="globalPreviewImageUrl" class="media-preview-overlay" @click="closeGlobalPreview">
    <img
      :src="globalPreviewImageUrl"
      alt="Media preview"
      class="media-preview-image"
      @click.stop
    />
  </div>
</template>