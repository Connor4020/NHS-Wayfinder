<template>
  <div>
    <h1>Users</h1>
    <div v-if="error">Error loading users.</div>
    <div v-else-if="pending">Loading...</div>
    <div v-else>
      <table v-if="users && users.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users" :key="idx">
            <td v-for="col in columns" :key="col">{{ user[col] }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>No users found.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const { data: users, pending, error } = await useFetch('/api/users')
const columns = computed(() => (users?.value?.length ? Object.keys(users.value[0]) : []))
</script>
