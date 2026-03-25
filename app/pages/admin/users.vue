<script setup>
import { reactive, ref, computed, watch } from 'vue'
import useConfirmAction from '../../../composables/useConfirmAction'

const { confirmAndRun } = useConfirmAction()


async function deleteUser(username) {
  await confirmAndRun('Delete this user?', async () => {
    try {
      await $fetch('/api/users', { method: 'DELETE', body: { username } })
      await refreshUsers()
    } catch (err) {
      console.error(err)
      alert('Failed to delete user')
    }
  })
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

const { data: users, pending, refresh: refreshUsers } = await useFetch('/api/users')
const columns2 = computed(() => (users?.value?.length ? Object.keys(users.value[0]) : []))
</script>





<template>
  <main class="media-page">
  <div>
    <h1>User management</h1>
    <div v-if="error">Error loading users.</div>
    <div v-else-if="pending">Loading…</div>
    <div v-else>
      <div v-if="users && users.length" class="media-table-scroll">
        <table class="styled-table media-data-table">
          <thead>
            <tr>
              <th v-for="col in columns2" :key="col">{{ col }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, idx) in users" :key="idx">
              <td v-for="col in columns2" :key="col">{{ user[col] }}</td>
              <td><button @click="deleteUser(user.username)" class="table-btn">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>No users found.</div>
    </div>
  </div>

  <div>
    <h1>Add User</h1>
    <div v-if="columnsPending">Loading form…</div>
    <div v-else class="users-form-wrap">
      <form class="users-form" @submit.prevent="submit">
        <div v-for="col in formColumns" :key="col.name" class="form-group">
          <label :for="col.name">{{ col.name === 'password_hash' ? 'password' : col.name }}</label>
          <input :id="col.name" v-model="form[col.name]" :type="col.name === 'password_hash' ? 'password' : 'text'" required />
        </div>
        <button type="submit" class="btn-submit">Add User</button>
      </form>
      <div v-if="message">{{ message }}</div>
    </div>
  </div>
  </main>
</template>

