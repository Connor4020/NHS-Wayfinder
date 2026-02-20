<script setup>
import { reactive, ref, computed, watch } from 'vue'

const { data: media, pending, refresh } = await useFetch('./api/user')


async function deleteUser(username) {
  if (!confirm('Delete this user?')) return
  try {
    await $fetch('/api/users', { method: 'DELETE', body: { username } })
    await refresh()
  } catch (err) {
    console.error(err)
    alert('Failed to delete user')
  }
}


const { data: cols, pending: columnsPending, error } = await useFetch('/api/users/columns')
const columns = computed(() => {
  const raw = cols?.value
  return Array.isArray(raw) ? raw.filter(c => c && typeof c.name === 'string') : []
})
const formColumns = computed(() =>
  columns.value.filter(c => ['username', 'password_hash'].includes(c.name))
)
const form = reactive({})
const message = ref('')

watch(columns, (newCols) => {
  newCols.forEach(c => {
    form[c.name] = ''
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

useHead({
  link: [
    { rel: 'stylesheet', href: '/css/style.css' }
  ]
})
</script>





<template>
  <div>
    <h1>User management</h1>
    <div v-if="error2">Error loading users.</div>
    <div v-else-if="pending2">Loading…</div>
    <div v-else>
      <table v-if="users2 && users2.length" class="styled-table">
        <thead>
          <tr>
            <th v-for="col in columns2" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users2" :key="idx">
            <td v-for="col in columns2" :key="col">{{ user[col] }}</td>
            <td><button @click="deleteUser(user.username)" class="btn-delete">Delete</button></td>
          </tr>
        </tbody>
      </table>
      <div v-else>No users found.</div>
    </div>
  </div>

  <div>
    <h1>Add User</h1>
    <div v-if="columnsPending">Loading form…</div>
    <div v-else class="form-container">
      <form @submit.prevent="submit">
        <div v-for="col in formColumns" :key="col.name" class="form-group">
          <label :for="col.name">{{ col.name === 'password_hash' ? 'password' : col.name }}</label>
          <input :id="col.name" v-model="form[col.name]" :type="col.name === 'password_hash' ? 'password' : 'text'" required />
        </div>

        <button type="submit" class="btn-submit">Add User</button>
      </form>
      <div v-if="message">{{ message }}</div>
    </div>
  </div>
</template>

