<script setup>
import { ref, computed, watchEffect } from 'vue'
import usePagination from '../../../composables/usePagination'
import useNodeLabels from '../../../composables/useNodeLabels'
import useConfirmAction from '../../../composables/useConfirmAction'

const { confirmAndRun } = useConfirmAction()

const node_name = ref('')
const message = ref('')
const loading = ref(false)
const deleting = ref(false)
const updatingAccessibility = ref(false)
const PAGE_SIZE = 50
const nodesTotal = ref(0)
const connectionsTotal = ref(0)
const {
  page: nodesPage,
  offset: nodesOffset,
  totalPages: nodesTotalPages,
  hasPrev: nodesHasPrev,
  hasNext: nodesHasNext,
  nextPage: nextNodesPage,
  prevPage: prevNodesPage,
} = usePagination(nodesTotal, PAGE_SIZE)

const {
  page: connectionsPage,
  offset: connectionsOffset,
  totalPages: connectionsTotalPages,
  hasPrev: connectionsHasPrev,
  hasNext: connectionsHasNext,
  nextPage: nextConnectionsPage,
  prevPage: prevConnectionsPage,
} = usePagination(connectionsTotal, PAGE_SIZE)

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

const { data: nodesResponse, pending: pendingNodes, error: errorNodes, refresh: refreshNodes } = await useFetch('/api/node', {
  query: computed(() => ({
    limit: PAGE_SIZE,
    offset: nodesOffset.value
  }))
})

const { data: connectionsResponse, pending: pendingConnections, error: errorConnections, refresh: refreshConnections } = await useFetch('/api/connection', {
  query: computed(() => ({
    limit: PAGE_SIZE,
    offset: connectionsOffset.value
  }))
})

const locations = computed(() => (nodesResponse.value && nodesResponse.value.items) ? nodesResponse.value.items : [])
const connections = computed(() => (connectionsResponse.value && connectionsResponse.value.items) ? connectionsResponse.value.items : [])
const nodesShowingCount = computed(() => locations.value.length)
const connectionsShowingCount = computed(() => connections.value.length)
watchEffect(() => {
  nodesTotal.value = Number((nodesResponse.value && nodesResponse.value.total) || 0)
  connectionsTotal.value = Number((connectionsResponse.value && connectionsResponse.value.total) || 0)
})

const { nodeLabel } = useNodeLabels(locations)

const deleteNode = async (node_id) => {
  await confirmAndRun(`Delete node ${node_id}? This cannot be undone.`, async () => {
    deleting.value = true
    try {
      await $fetch('/api/node', { method: 'DELETE', body: { node_id } })
      message.value = `Deleted node ${node_id}`
      await refreshNodes()
      await refreshConnections()
    } catch (err) {
      message.value = String(err?.data?.message || err?.message || err)
    } finally { deleting.value = false }
  })
}

const deleteConnection = async (n1, n2) => {
  await confirmAndRun(`Delete connection ${n1} ↔ ${n2}?`, async () => {
    deleting.value = true
    try {
      await $fetch('/api/connection', { method: 'DELETE', body: { node_1: n1, node_2: n2 } })
      message.value = `Deleted connection ${n1}-${n2}`
      await refreshConnections()
      await refreshNodes()
    } catch (err) {
      message.value = String(err?.data?.message || err?.message || err)
    } finally { deleting.value = false }
  })
}

const updateConnectionAccessibility = async (n1, n2, nextValue) => {
  updatingAccessibility.value = true
  try {
    await $fetch('/api/connection', {
      method: 'PATCH',
      body: { node_1: n1, node_2: n2, wheelchair_accessible: !!nextValue }
    })
    message.value = `Updated accessibility for ${n1}-${n2}`
    await refreshConnections()
  } catch (err) {
    message.value = String(err?.data?.message || err?.message || err)
  } finally { updatingAccessibility.value = false }
}

</script>

<template>
  <main>


  <div>
      <div>
    <h1>node management</h1>
  </div>
    <h1>Add Node</h1>
    <div class="form-group">
      <label>Node name</label>
      <input v-model="node_name" placeholder="e.g. Entrance A" maxlength="100" />
      <small>{{ node_name.length }}/100</small>
    </div>
    <div>
      <button :disabled="loading || !valid" @click="submit">Create Node</button>
    </div>
  </div>

  <div>
    <h2>Existing Nodes</h2>
    <div v-if="errorNodes">Error loading nodes.</div>
    <div v-else-if="pendingNodes">Loading…</div>
    <div v-else>
      <div class="nodes-toolbar">
        <span class="nodes-toolbar-meta">Showing {{ nodesShowingCount }} / {{ nodesTotal }} nodes</span>
        <div class="nodes-toolbar-buttons">
          <button class="nodes-toolbar-button" :disabled="!nodesHasPrev || pendingNodes" @click="prevNodesPage">Previous page</button>
          <button class="nodes-toolbar-button" :disabled="!nodesHasNext || pendingNodes" @click="nextNodesPage">Next page</button>
          <button class="nodes-toolbar-button" :disabled="pendingNodes" @click="refreshNodes">Refresh</button>
        </div>
        <span class="nodes-toolbar-meta">Page {{ nodesPage }} / {{ nodesTotalPages }}</span>
      </div>
    <div class="media-table-scroll">
      <table class="styled-table media-data-table">
        <thead>
          <tr>
            <th>Node name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loc in locations" :key="loc.node_id">
            <td>{{ loc.node_name }}</td>
            <td><button class="nodes-toolbar-button" @click="deleteNode(loc.node_id)" :disabled="deleting">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>

  <div>
    <h2>Connections</h2>
    <div v-if="errorConnections">Error loading connections.</div>
    <div v-else-if="pendingConnections">Loading…</div>
    <div v-else>
      <div class="nodes-toolbar">
        <span class="nodes-toolbar-meta">Showing {{ connectionsShowingCount }} / {{ connectionsTotal }} connections</span>
        <div class="nodes-toolbar-buttons">
          <button class="nodes-toolbar-button" :disabled="!connectionsHasPrev || pendingConnections" @click="prevConnectionsPage">Previous page</button>
          <button class="nodes-toolbar-button" :disabled="!connectionsHasNext || pendingConnections" @click="nextConnectionsPage">Next page</button>
          <button class="nodes-toolbar-button" :disabled="pendingConnections" @click="refreshConnections">Refresh</button>
        </div>
        <span class="nodes-toolbar-meta">Page {{ connectionsPage }} / {{ connectionsTotalPages }}</span>
      </div>
    <div class="media-table-scroll">
      <table class="styled-table media-data-table">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Wheelchair accessible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in connections" :key="`${c.node_1}-${c.node_2}`">
            <td>{{ nodeLabel(c.node_1) }}</td>
            <td>{{ nodeLabel(c.node_2) }}</td>
            <td>
              <label>
                <input
                  type="checkbox"
                  :checked="!!c.wheelchair_accessible"
                  :disabled="updatingAccessibility || deleting"
                  @change="updateConnectionAccessibility(c.node_1, c.node_2, ($event.target).checked)"
                />
                wheelchair accessible
              </label>
            </td>
            <td><button class="nodes-toolbar-button" @click="deleteConnection(c.node_1, c.node_2)" :disabled="deleting">Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</main>
</template>