<script setup>
import { reactive, ref, computed, watch } from 'vue'
const { data: cols, pending: columnsPending, error } = await useFetch('/api/users/columns')
const columns = computed(() => cols?.value ?? [])
const form = reactive({})
const message = ref('')

watch(columns, (newCols) => {
  newCols.forEach(c => {
     {
      form[c.name] = ''
    }
  })
}, { immediate: true })

async function submit() {
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    message.value = 'User added successfully.'
    // clear form
    Object.keys(form).forEach(k => form[k] = '')
  } catch (e) {
    message.value = e?.data?.statusMessage || 'Failed to add user.'
  }
}

const { data: users2, pending2, error2 } = await useFetch('/api/users')
const columns2 = computed(() => (users2?.value?.length ? Object.keys(users2.value[0]) : []))
</script>





<template>
  <div>
    <h1>Users</h1>
    <div v-if="error2">Error loading users.</div>
    <div v-else-if="pending2">Loading…</div>
    <div v-else>
      <table v-if="users2 && users2.length">
        <thead>
          <tr>
            <th v-for="col in columns2" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users2" :key="idx">
            <td v-for="col in columns2" :key="col">{{ user[col] }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>No users found.</div>
    </div>
  </div>

  <div>
    <h1>Add User</h1>
    <div v-if="columnsPending">Loading form…</div>
    <div v-else>
      <form @submit.prevent="submit">

        <div>
            <p>Note: Only username and password are required. Other fields will be ignored.</p>
        </div>
        
        <div v-for="col in columns" :key="col.name">
          <label :for="col.name">{{ col.name }}</label>
          <input
            :id="col.name"
            v-model="form[col.name]"
            :type="col.type && col.type.toLowerCase().includes('int') ? 'number' : 'text'"
          />
        </div>
        <button type="submit">Add User</button>
      </form>
      <div v-if="message">{{ message }}</div>
    </div>
  </div>
</template>

