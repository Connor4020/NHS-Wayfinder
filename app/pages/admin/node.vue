<script setup>
import { ref, computed } from 'vue'

const node_name = ref('')
const message = ref('')
const loading = ref(false)
const deleting = ref(false)

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
    await refreshNodes()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { loading.value = false }
}

const { data: locations, pending: pendingNodes, error: errorNodes, refresh: refreshNodes } = await useFetch('/api/node')
const { data: connections, pending: pendingConnections, error: errorConnections, refresh: refreshConnections } = await useFetch('/api/connection')

const deleteNode = async (node_id) => {
  if (!confirm(`Delete node ${node_id}? This cannot be undone.`)) return
  deleting.value = true
  try {
    await $fetch('/api/node', { method: 'DELETE', body: { node_id } })
    message.value = `Deleted node ${node_id}`
    await refreshNodes()
    await refreshConnections()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { deleting.value = false }
}

const deleteConnection = async (n1, n2) => {
  if (!confirm(`Delete connection ${n1} ↔ ${n2}?`)) return
  deleting.value = true
  try {
    await $fetch('/api/connection', { method: 'DELETE', body: { node_1: n1, node_2: n2 } })
    message.value = `Deleted connection ${n1}-${n2}`
    await refreshConnections()
    await refreshNodes()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { deleting.value = false }
}

</script>

<template>


  <div class="box-container-center">
    <AdminBackButton />
      <div>
    <h1>node management</h1>
  </div>
    <h1>Add Node</h1>
    <div>
      <label>Node name</label>
      <input v-model="node_name" placeholder="e.g. Entrance A" maxlength="100" />
      <small>{{ node_name.length }}/100</small>
    </div>
    <div>
      <button :disabled="loading || !valid" @click="submit">Create Node</button>
      <NuxtLink to="/admin/media">Assign media</NuxtLink>
    </div>
  </div>

  <div class="box-container-center">
    <h2>Existing Nodes</h2>
    <div v-if="errorNodes">Error loading nodes.</div>
    <div v-else-if="pendingNodes">Loading…</div>
    <ul v-else>
      <li v-for="loc in locations" :key="loc.node_id">
        {{ loc.node_id }}: {{ loc.node_name }}
        <button @click="deleteNode(loc.node_id)" :disabled="deleting">Delete</button>
      </li>
    </ul>
  </div>

  <div class="box-container-center">
    <h2>Connections</h2>
    <div v-if="errorConnections">Error loading connections.</div>
    <div v-else-if="pendingConnections">Loading…</div>
    <ul v-else>
      <li v-for="c in connections" :key="`${c.node_1}-${c.node_2}`">
        {{ c.node_1 }} ↔ {{ c.node_2 }}
        <span v-if="c.wheelchair_accessible">(wheelchair accessible)</span>
        <button @click="deleteConnection(c.node_1, c.node_2)" :disabled="deleting">Delete</button>
      </li>
    </ul>
  </div>

</template>