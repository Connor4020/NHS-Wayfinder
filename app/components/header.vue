<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import GoogleTranslate from "./GoogleTranslate.vue";
import useAuth from "../../server/api/use-auth";

const isDropdownOpen = ref(false);
const headerRoot = ref(null);
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const onDocumentClick = (event) => {
  const root = headerRoot.value;
  if (!root) return;
  if (!root.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// use shared auth composable so UI updates when other parts of the app call fetchUserData()
const { user, fetchUserData, logout: authLogout } = useAuth();

onMounted(async () => {
  try {
    await fetchUserData();
  } catch (_) {}
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});

const logout = async () => {
    try {
    await $fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("logout failed", err);
  }
  try { authLogout(); } catch (_) {}
  window.location.href = "/";
};
</script>

<template>
  <header ref="headerRoot" class="header">
    <div id="Topbar">
      <div class="logo">
        <img src="/resources/nhs_logo.jpg" alt="NHS Wayfinder Logo" />
        <a class="logo-text">Northern General Hospital</a>
      </div>
      <div class="topbar-actions">
        <GoogleTranslate />
      </div>
    </div>
    <nav class="navbar">
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li id="hidelink"><NuxtLink to="/about">About</NuxtLink></li>
        <li id="hidelink"><NuxtLink to="/contact">Contact</NuxtLink></li>
        <li v-if="user" id="hidelink">
          <NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink>
        </li>
        <li v-if="user" id="hidelink">
          <NuxtLink to="/admin/media">Media</NuxtLink>
        </li>
        <li v-if="user">
          <NuxtLink to="/admin/dashboard">Dashboard</NuxtLink>
        </li>
         <li v-if="!user">
          <NuxtLink to="/login">Login</NuxtLink>
        </li>
        <li id="hidelink" v-else>
          <NuxtLink to="#" @click.prevent="logout">Logout</NuxtLink>
        </li>
        <li id="Morebtn" @click.prevent="toggleDropdown"><a>More</a></li>
      </ul>
    </nav>
    <div class="dropdown" v-show="isDropdownOpen" @click="closeDropdown">
      <ul>
        <li v-if="user"><a href="#" @click.prevent="logout">Logout</a></li>
        <li><NuxtLink to="/about">About</NuxtLink></li>
        <li><NuxtLink to="/contact">Contact</NuxtLink></li>
        <li v-if="user">
          <NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink>
        </li>
        <li v-if="user"><NuxtLink to="/admin/media">Media</NuxtLink></li>
        <li v-if="user"><NuxtLink to="/admin/node">Add Node</NuxtLink></li>
        <li v-if="user">
          <NuxtLink to="/admin/connections">Connections</NuxtLink>
        </li>
        <li v-if="user"><NuxtLink to="/admin/users"> Users</NuxtLink></li>
      </ul>
    </div>
  </header>
</template>
