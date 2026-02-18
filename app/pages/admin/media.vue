<script setup>
import { computed, reactive, ref } from 'vue'

const uploadForm = reactive({ media: '' })
const uploadMessage = ref('')
const uploadLoading = ref(false)

const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')
const { data: media, pending: mediaPending, error: mediaError, refresh: refreshMedia } = await useFetch('/api/media')

const connection_node_1 = ref(null)
const connection_node_2 = ref(null)
const media_id = ref(null)
const order_num = ref('')
const assignMessage = ref('')
const assignLoading = ref(false)

const uses_lift = ref(false)
const uses_stairs = ref(false)
const wheelchair_accessible = ref(false)

const searchNodes = ref('')
const searchMedia = ref('')

const filteredNodes = computed(() => {
  const q = String(searchNodes.value || '').toLowerCase()
  const list = (nodes && nodes.value) || []
  return list.filter((n) => n.node_name.toLowerCase().includes(q) || String(n.node_id).includes(q))
})

const filteredMedia = computed(() => {
  const q = String(searchMedia.value || '').toLowerCase()
  const list = (media && media.value) || []
  return list.filter((m) => (m.media_type || '').toLowerCase().includes(q) || String(m.media_id).includes(q))
})

const selectedMediaObj = computed(() => {
  const list = (media && media.value) || []
  return list.find((m) => m.media_id === Number(media_id.value))
})

const canSubmitAssign = computed(() => {
  return connection_node_1.value && connection_node_2.value && media_id.value && connection_node_1.value !== connection_node_2.value
})

const submitUpload = async () => {
  uploadMessage.value = ''
  uploadLoading.value = true
  try {
    await $fetch('/api/upload', { method: 'POST', body: { media_type: '2', media_url: uploadForm.media } })
    uploadMessage.value = 'Media uploaded successfully.'
    Object.keys(uploadForm).forEach((k) => { uploadForm[k] = '' })
    if (refreshMedia) { await refreshMedia() }
  } catch (e) {
    uploadMessage.value = e?.data?.statusMessage || 'Failed to upload media.'
  } finally {
    uploadLoading.value = false
  }
}

const submitAssign = async () => {
  if (!canSubmitAssign.value) {
    assignMessage.value = 'Please select two different nodes and a media item'
    return
  }

  assignLoading.value = true
  try {
    await $fetch('/api/connection', {
      method: 'POST',
      body: {
        node_1: Number(connection_node_1.value),
        node_2: Number(connection_node_2.value),
        uses_lift: !!uses_lift.value,
        uses_stairs: !!uses_stairs.value,
        wheelchair_accessible: !!wheelchair_accessible.value
      }
    }).catch(() => {})

    await $fetch('/api/connection-media', {
      method: 'POST',
      body: {
        connection_node_1: Number(connection_node_1.value),
        connection_node_2: Number(connection_node_2.value),
        media_id: Number(media_id.value),
        order_num: order_num.value ? Number(order_num.value) : null
      }
    })

    assignMessage.value = 'Media assigned to connection'
    order_num.value = ''
  } catch (err) {
    assignMessage.value = String(err?.data?.message || err?.message || err)
  } finally {
    assignLoading.value = false
  }
}
</script>

<template>
  <div>
    <h1>Media management</h1>

    <section>
      <h2>Upload media</h2>
      <form @submit.prevent="submitUpload">
        <div>
          <label for="media">Select media link:</label>
          <input id="media" name="media" type="url" v-model="uploadForm.media" required />
        </div>
        <button type="submit" :disabled="uploadLoading">{{ uploadLoading ? 'Uploading…' : 'Upload' }}</button>
      </form>
      <div v-if="uploadMessage">{{ uploadMessage }}</div>
    </section>

    <section style="margin-top: 24px">
      <h2>Assign media to connection</h2>
      <div v-if="nodesPending || mediaPending">Loading nodes and media…</div>
      <div v-else-if="nodesError || mediaError">Unable to load nodes/media.</div>
      <div v-else>
        <div>
          <label>Search nodes</label>
          <input v-model="searchNodes" placeholder="filter nodes by name or id" />
        </div>

        <div>
          <label>From node</label>
          <select v-model="connection_node_1">
            <option :value="null">-- select --</option>
            <option v-for="n in filteredNodes" :key="n.node_id" :value="n.node_id">{{ n.node_name }} ({{ n.node_id }})</option>
          </select>
        </div>

        <div>
          <label>To node</label>
          <select v-model="connection_node_2">
            <option :value="null">-- select --</option>
            <option v-for="n in filteredNodes" :key="n.node_id + '-to'" :value="n.node_id">{{ n.node_name }} ({{ n.node_id }})</option>
          </select>
        </div>

        <div>
          <label>Search media</label>
          <input v-model="searchMedia" placeholder="filter media by type or id" />
        </div>

        <div>
          <label>Media</label>
          <select v-model="media_id">
            <option :value="null">-- select --</option>
            <option v-for="m in filteredMedia" :key="m.media_id" :value="m.media_id">{{ m.media_type }} — {{ m.media_id }}</option>
          </select>
        </div>

        <div v-if="selectedMediaObj">
          <h4>Preview</h4>
          <div v-if="selectedMediaObj.media_type && selectedMediaObj.media_type.startsWith('image')">
            <img :src="selectedMediaObj.media_url" alt="preview" style="max-width:300px; max-height:200px" />
          </div>
          <div v-else-if="selectedMediaObj.media_type && selectedMediaObj.media_type.startsWith('video')">
            <video :src="selectedMediaObj.media_url" controls style="max-width:300px; max-height:200px"></video>
          </div>
          <div v-else>
            <a :href="selectedMediaObj.media_url" target="_blank">Open media</a>
          </div>
        </div>

        <div style="margin-top:8px">
          <label style="display:block"><input type="checkbox" v-model="uses_lift" /> Uses lift</label>
          <label style="display:block"><input type="checkbox" v-model="uses_stairs" /> Uses stairs</label>
          <label style="display:block"><input type="checkbox" v-model="wheelchair_accessible" /> Wheelchair accessible</label>
        </div>

        <div>
          <label>Order number (optional)</label>
          <input v-model="order_num" type="number" min="0" />
        </div>

        <div>
          <button :disabled="assignLoading || !canSubmitAssign" @click="submitAssign">{{ assignLoading ? 'Saving…' : 'Create connection & assign media' }}</button>
          <NuxtLink to="/admin/add-node">Add node</NuxtLink>
        </div>

        <p v-if="assignMessage">{{ assignMessage }}</p>
      </div>
    </section>
  </div>
</template>