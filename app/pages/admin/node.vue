<script setup>
import { ref, computed } from 'vue'

const node_name = ref('')
const message = ref('')
const loading = ref(false)

const trimmed = computed(() => String(node_name.value || '').trim())
const valid = computed(() => trimmed.value.length > 0 && trimmed.value.length <= 100)

const submit = async () => {
  if (!valid.value) { message.value = 'Please enter a valid name (1-100 characters)'; return }
  loading.value = true
  try {
    const res = await $fetch('/api/node', {
      method: 'POST',
      body: { node_name: trimmed.value }
    })
    message.value = res.node_id ? `Created node ${res.node_id}` : 'Created node'
    node_name.value = ''
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { loading.value = false }
}

const { data: locations, pending, error } = await useFetch('/api/node')

</script>

<template>
    <div>
        <h1>node management</h1>
    </div>

    <div>
        <h1>Add Node</h1>
        <div>
            <label>Node name</label>
            <input v-model="node_name" placeholder="e.g. Entrance A" maxlength="100" />
            <small>{{ node_name.length }}/100</small>
        </div>
        <div>
            <button :disabled="loading || !valid" @click="submit">Create Node</button>
            <NuxtLink to="/admin/assign-media">Assign media</NuxtLink>
        </div>
        <p v-if="message">{{ message }}</p>
    </div>

    <div>
        <h2>Existing Nodes</h2>
        <div v-if="error">Error loading nodes.</div>
        <div v-else-if="pending">Loading…</div>
        <ul v-else>
            <li v-for="loc in locations" :key="loc.node_id">{{ loc.node_id }}: {{ loc.node_name }}</li>
        </ul>
    </div>

</template>