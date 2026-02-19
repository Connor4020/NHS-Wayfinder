<script setup>
import { computed } from 'vue'


const route = useRoute()
const node1 = route.query.node_1 ? Number(route.query.node_1) : null
const node2 = route.query.node_2 ? Number(route.query.node_2) : null

const { data: connections, pending: connectionsPending, error: connectionsError } = await useFetch('/api/connection')
const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')

const nodesMap = computed(() => {
  const map = {}
  const list = (nodes && nodes.value) || []
  for (const n of list) map[n.node_id] = n.node_name || n.name || String(n.node_id)
  return map
})

const isImage = (t) => {
  if (t == null) return false
  const s = String(t).toLowerCase()
  return s.startsWith('image') || s === '2' || s === 'image/png' || s === 'image/jpg' || s === 'image/jpeg'
}

const isVideo = (t) => {
  if (t == null) return false
  const s = String(t).toLowerCase()
  return s.startsWith('video') || s === '1' || s === 'video/mp4'
}

const selectedConnection = computed(() => {
  const list = (connections && connections.value) || []
  return list.find((c) => Number(c.node_1) === node1 && Number(c.node_2) === node2) || null
})
</script>


<template>

  <div>
    <h1>Selected route</h1>

    <p v-if="connectionsPending || nodesPending">Loading route...</p>
    <p v-if="connectionsError || nodesError">Error loading route.</p>

    <div v-if="selectedConnection">
      <h2>{{ nodesMap[selectedConnection.node_1] || selectedConnection.node_1 }} → {{ nodesMap[selectedConnection.node_2] || selectedConnection.node_2 }}</h2>
      <div>
        <h3>Route details:</h3>
        <span v-if="selectedConnection.wheelchair_accessible"> • wheelchair accessible</span>
        <span v-if="selectedConnection.uses_lift"> • lift</span>
        <span v-if="selectedConnection.uses_stairs"> • stairs</span>
      </div>

      <div v-if="selectedConnection.media && selectedConnection.media.length">
        <h3>Media</h3>
        <ul>
          <li v-for="m in selectedConnection.media" :key="m.media_id + '-' + m.order_num">
            <div>
              <span v-if="isImage(m.media_type)">
                <img :src="m.media_url" alt="media" style="max-width:220px; max-height:140px" />
              </span>
              <span v-else-if="isVideo(m.media_type)">
                <video :src="m.media_url" controls style="max-width:320px; max-height:180px"></video>
              </span>
              <span v-else>
                <a :href="m.media_url" target="_blank">Open media {{ m.media_id }}</a>
              </span>
              <small style="margin-left:8px">(id: {{ m.media_id }}{{ m.order_num ? ', order: ' + m.order_num : '' }})</small>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No media assigned to this route.</p>
      </div>
    </div>

    <p v-else-if="!connectionsPending">Route not found.</p>

    <NuxtLink to="/admin/list-routesadmin">Back to Routes List</NuxtLink>
  </div>
</template>
