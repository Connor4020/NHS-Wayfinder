<template>
    <header class="header">
        <div id="Topbar">
            <div class="logo">
                <h1>NHS</h1>
            </div>
            <div class="account">
                <NuxtLink v-if="!user" to="/login">Login</NuxtLink>

            </div>
        </div>    
        <nav class="navbar">
            <ul>
                <li id="link1"><a href="#home">Home</a></li>
                <li id="link2"><a href="#services">Services</a></li>
                <li id="link3"><a href="#about">About</a></li>
                <li id="link4"><a href="#contact">Contact</a></li>
                <li id="Morebtn" @click.prevent="toggleDropdown"><a>More</a></li>

            </ul>
        </nav>
        <div class="dropdown" v-show="isDropdownOpen">
            <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </div>
    </header>
</template>

<script>
import '../public/css/header.css';

export default {
  name: 'AppHeader', // Multi-word name
  data() {
    return {
      isDropdownOpen: false // Reactive state for the dropdown
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }
};
</script>
