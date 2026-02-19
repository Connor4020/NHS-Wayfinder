<script setup>
import { computed, ref, watch } from 'vue'
import useMediaChecks from '../../composables/useMediaChecks'


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

const { isImageType, isVideoType } = useMediaChecks()

const selectedConnection = computed(() => {
  const list = (connections && connections.value) || []
  return list.find((c) => Number(c.node_1) === node1 && Number(c.node_2) === node2) || null
})

const mediaList = computed(() => {
  const sc = (selectedConnection && selectedConnection.value) || null
  return (sc && sc.media) ? sc.media : []
})

const currentIndex = ref(0)

watch(selectedConnection, () => {
  currentIndex.value = 0
})

const currentMedia = computed(() => {
  return mediaList.value.length ? mediaList.value[Math.min(Math.max(0, currentIndex.value), mediaList.value.length - 1)] : null
})

const prevMedia = () => {
  if (currentIndex.value > 0) currentIndex.value--
}

const nextMedia = () => {
  if (currentIndex.value < mediaList.value.length - 1) currentIndex.value++
}
</script>


<template>

  <div class="box-container-center">
    <h1>Selected route</h1>

    <p v-if="connectionsPending || nodesPending">Loading route...</p>
    <p v-if="connectionsError || nodesError">Error loading route.</p>

    <div v-if="selectedConnection">
      <h2>{{ nodesMap[selectedConnection.node_1] || selectedConnection.node_1 }} → {{ nodesMap[selectedConnection.node_2] || selectedConnection.node_2 }}</h2>
      <div class="location-text">
        <h3>Route details:</h3>
        <span v-if="selectedConnection.is_wheelchair_inaccessible"> • wheelchair inaccessible</span>
      </div>

      <div v-if="mediaList && mediaList.length" class="">
        <h3>Media</h3>
        <div>
          <div v-if="currentMedia">
            <span v-if="isImageType(currentMedia)">
              <img :src="currentMedia.media_url" alt="media" style="max-width:220px; max-height:140px" />
            </span>
            <span v-else-if="isVideoType(currentMedia)">
              <video :src="currentMedia.media_url" controls style="max-width:320px; max-height:180px"></video>
            </span>
            <span v-else>
              <a :href="currentMedia.media_url" target="_blank">Open media {{ currentMedia.media_id }}</a>
            </span>
            <small style="margin-left:8px">(id: {{ currentMedia.media_id }}{{ currentMedia.order_num ? ', order: ' + currentMedia.order_num : '' }})</small>
          </div>

          <div style="margin-top:8px">
            <button @click="prevMedia" :disabled="currentIndex === 0">Previous</button>
            <span style="margin:0 8px">{{ currentIndex + 1 }} / {{ mediaList.length }}</span>
            <button @click="nextMedia" :disabled="currentIndex >= mediaList.length - 1">Next</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No media assigned to this route.</p>
      </div>
    </div>

    <p v-else-if="!connectionsPending">Route not found.</p>

    <NuxtLink to="/admin/list-routesadmin">Back to Routes List</NuxtLink>
  </div>
</template>
