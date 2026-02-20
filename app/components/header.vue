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
                
            </div>
        </div>
        <nav class="navbar">
            <ul>
                <li><NuxtLink to="/">Home</NuxtLink></li>
                <li id="hidelink"><NuxtLink to="/about">About</NuxtLink></li>
                <li id="hidelink"><NuxtLink to="/contact">Contact</NuxtLink></li>
                <li id="hidelink" v-if="!user"><NuxtLink to="/login">Login</NuxtLink></li>
                <li id="hidelink" v-else><NuxtLink to="#" @click.prevent="logout">Logout</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/media">Media</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/node">Add Node</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/connections">Connections</NuxtLink></li>
                <li v-if="user" id="hidelink"><NuxtLink to="/admin/users"> Users</NuxtLink></li>
                <li id="Morebtn" @click.prevent="toggleDropdown"><a>More</a></li>
            </ul>
        </nav>
        <div class="dropdown" v-show="isDropdownOpen">
            <ul>
                <li v-if="!user"><a href="/login">Login</a></li>
                <li v-if="user"><a href="#" @click.prevent="logout">Logout</a></li>
                <li><NuxtLink to="/about">About</NuxtLink></li>
                <li><NuxtLink to="/contact">Contact</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/bfs-debug">BFS Debug</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/media">Media</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/dashboard">Dashboard</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/node">Add Node</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/connections">Connections</NuxtLink></li>
                <li v-if="user"><NuxtLink to="/admin/users"> Users</NuxtLink></li>
            </ul>
        </div>
    </header>
</template>
