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
</script>





<template>
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

