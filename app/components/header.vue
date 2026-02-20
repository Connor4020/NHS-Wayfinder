<script setup>
import '../public/css/header.css'
import { ref, computed } from 'vue'
import GoogleTranslate from './GoogleTranslate.vue'

const isDropdownOpen = ref(false)
const toggleDropdown = () => { isDropdownOpen.value = !isDropdownOpen.value }

// fetch current user; returns { user: null } when not authenticated
const { data: current } = await useFetch('/api/current-user')
const user = computed(() => current.value?.user ?? null)

const logout = async () => {
    try {
        await $fetch('/api/logout', { method: 'POST' })
    } catch (err) {
        // ignore errors but log for debugging
        console.error('logout failed', err)
    }
    // reload to update auth state
    window.location.href = '/'
}


</script>

<template>
    <header class="header">
        <div id="Topbar">
            <div class="logo">
              <img src="/resources/nhs_logo.jpg" alt="NHS Wayfinder Logo">
                            <p class="logo-text">Northern General Hospital</p>
            </div>
                        <div class="topbar-actions">
                                <GoogleTranslate />
                                <div class="account">
                                        <NuxtLink v-if="!user" to="/login">Login</NuxtLink>
                                        <NuxtLink v-else to="#" @click.prevent="logout">
                                                Logout
                                        </NuxtLink>
                                </div>
            </div>
        </div>
        <nav class="navbar">
            <ul>
                <li id="link1"><NuxtLink to="/">Home</NuxtLink></li>
                <li id="link2"><NuxtLink to="/find-location">Find Location</NuxtLink></li>
                <li id="link3"><NuxtLink to="/about">About</NuxtLink></li>
                <li id="link4"><NuxtLink to="/contact">Contact</NuxtLink></li>
                <li><NuxtLink to="/admin/media">Media</NuxtLink></li>
                <li><NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink></li>
                <li><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></li>
                <li><NuxtLink to="/admin/node">Add Node</NuxtLink></li>
                <li><NuxtLink to="/admin/connections">Connections</NuxtLink></li>
                <li><NuxtLink to="/admin/users"> Users</NuxtLink></li>
                <li id="Morebtn" @click.prevent="toggleDropdown"><a>More</a></li>
            </ul>
        </nav>
        <div class="dropdown" v-show="isDropdownOpen">
            <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li v-if="!user"><a href="/login">Login</a></li>
                <li v-if="user"><NuxtLink to="/admin/add-node">Add Node</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/assign-media">Assign Media</NuxtLink></li>
                <li v-if="user"><a href="#" @click.prevent="logout">Logout</a></li>
            </ul>
        </div>
    </header>
</template>
