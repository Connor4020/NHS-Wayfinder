<script setup>
import { computed, ref, watch } from 'vue'
import useMediaChecks from '../../composables/useMediaChecks'


const route = useRoute()
const node1 = route.query.node_1 ? Number(route.query.node_1) : null
const node2 = route.query.node_2 ? Number(route.query.node_2) : null

// if a path of nodes are provided use these
const pathQuery = route.query.path ? String(route.query.path) : null
// split the path/connection chain into a array
const pathNodes = pathQuery ? pathQuery.split(',').map(s => s.trim()).filter(Boolean).map(n => Number(n)) : null

const { data: connections, pending: connectionsPending, error: connectionsError } = await useFetch('/api/connection')
const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')

// build a map of node_id to node_name for easy lookup
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

// If a path of nodes is provided comma seperated nodes,
// build a chain of connections that link nodes in order
const connectionChain = computed(() => {
  const list = (connections && connections.value) || []
  if (!pathNodes || pathNodes.length < 2) return []
  // start building the chain for the path of nodes in order
  const chain = []
  for (let i = 0; i < pathNodes.length - 1; i++) {

    const a = Number(pathNodes[i])
    const b = Number(pathNodes[i + 1])

    // try to find a connection that links these nodes in either direction
    let conn = list.find(c => Number(c.node_1) === a && Number(c.node_2) === b)
    if (!conn) conn = list.find(c => Number(c.node_1) === b && Number(c.node_2) === a)
    if (conn) chain.push(conn)
  }
  return chain
})

// combine the media across the connection chain
const combinedMediaList = computed(() => {
  const chain = connectionChain.value || []
  // final combined list of media and nodes
  const combined = []
  for (let ci = 0; ci < chain.length; ci++) {
    const conn = chain[ci]
    const medias = (conn && conn.media) ? conn.media.slice().sort((x,y) => (x.order_num || 0) - (y.order_num || 0)) : []
    for (const m of medias) {
      combined.push(Object.assign({}, m, { __connIndex: ci, __node_1: conn.node_1, __node_2: conn.node_2 }))
    }
  }
  return combined
})

const mediaList = computed(() => {
  // If connection chain exists, use combined list
  if (pathNodes && pathNodes.length > 1) return combinedMediaList.value
  const sc = (selectedConnection && selectedConnection.value) || null
  return (sc && sc.media) ? sc.media : []
})

const currentIndex = ref(0)

watch(() => route.query.path, () => {
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

    <div v-if="pathNodes && pathNodes.length > 1">
      <h2>Route: {{ pathNodes.join(' → ') }}</h2>
      <div class="location-text">
        <h3>Route chain:</h3>
        <span v-if="connectionChain && connectionChain.length">Connections: {{ connectionChain.length }}</span>
      </div>

      <div class="box-container-center">
        <div v-if="mediaList && mediaList.length" class="">
          <h3>Media</h3>
          <div>
            <div v-if="currentMedia">
              <h4>Connection {{ (currentMedia.__connIndex || 0) + 1 }} of {{ connectionChain.length }} — {{ nodesMap[currentMedia.__node_1] || currentMedia.__node_1 }} → {{ nodesMap[currentMedia.__node_2] || currentMedia.__node_2 }}</h4>
              <span v-if="isImageType(currentMedia)">
                <img :src="currentMedia.media_url" alt="media" style="max-width:220px; max-height:140px" />
              </span>
              <span v-else-if="isVideoType(currentMedia)">
                <video :src="currentMedia.media_url" controls style="max-width:320px; max-height:180px"></video>
              </span>
              <span v-else>
                <a :href="currentMedia.media_url" target="_blank">Open media {{ currentMedia.media_id }}</a>
              </span>
              <h4 style="margin-top:12px">Details for this media:</h4>
              <small style="margin-left:8px">(id: {{ currentMedia.media_id }}{{ currentMedia.order_num ? ', order: ' + currentMedia.order_num : '' }})</small>
              <div v-if="currentMedia.content_desc" style="margin-top:6px"><em>{{ currentMedia.content_desc }}</em></div>
            </div>

            <div style="margin-top:8px">
              <button @click="prevMedia" :disabled="currentIndex === 0">Previous</button>
              <span style="margin:0 8px">{{ currentIndex + 1 }} / {{ mediaList.length }}</span>
              <button @click="nextMedia" :disabled="currentIndex >= mediaList.length - 1">Next</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No media assigned across this route chain.</p>
        </div>
      </div>
    </div>

    <div v-else-if="selectedConnection">
      <h2>{{ nodesMap[selectedConnection.node_1] || selectedConnection.node_1 }} → {{ nodesMap[selectedConnection.node_2] || selectedConnection.node_2 }}</h2>
      <div class="location-text">
        <h3>Route details:</h3>
        <span v-if="selectedConnection.wheelchair_accessible"> • wheelchair accessible</span>
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
            <div v-if="currentMedia.content_desc" style="margin-top:6px"><p>{{ currentMedia.content_desc }}</p></div>
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

    <NuxtLink to="/">go back home</NuxtLink>
  </div>
</template>
