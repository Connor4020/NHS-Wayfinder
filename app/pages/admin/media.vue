<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import useMediaChecks from '../../../composables/useMediaChecks'
import useGlobalMediaPreview from '../../../composables/useGlobalMediaPreview'
import usePagination from '../../../composables/usePagination'
import useConfirmAction from '../../../composables/useConfirmAction'

const { confirmAndRun } = useConfirmAction()


async function deleteMedia(media_url) {
  await confirmAndRun('Delete this media resource?', async () => {
    try {
      await $fetch('/api/media', { method: 'DELETE', body: { media_url } })
      if (typeof refreshMedia === 'function') await refreshMedia()
    } catch (err) {
      console.error(err)
      alert('Failed to delete media resource')
    }
  })
}

async function renameMedia(mediaId) {
  const newName = prompt('Enter display name for this media (keeps original URL):')
  if (!newName) return
  try {
    await $fetch('/api/media/name', { method: 'POST', body: { media_id: Number(mediaId), media_name: String(newName).trim() } })
    if (typeof refreshMedia === 'function') await refreshMedia()
    alert('Display name updated')
  } catch (err) {
    console.error(err)
    alert('Failed to update display name: ' + (err?.data?.statusMessage || err?.message || err))
  }
}

const uploadForm = reactive({ media: '', file_name: '' })
const useFile = ref(false)
const fileInput = ref(null)
const uploadMessage = ref('')
const uploadLoading = ref(false)
const MEDIA_PAGE_SIZE = 50
const mediaTotal = ref(0)
const {
  page: mediaPage,
  offset: mediaOffset,
  totalPages: mediaTotalPages,
  hasPrev: mediaHasPrev,
  hasNext: mediaHasNext,
  nextPage: nextMediaPage,
  prevPage: prevMediaPage
} = usePagination(mediaTotal, MEDIA_PAGE_SIZE)

const { data: nodes, pending: nodesPending, error: nodesError } = await useFetch('/api/node')
const { data: mediaResponse, pending: mediaPending, error: mediaError, refresh: refreshMedia } = await useFetch('/api/media', {
  query: computed(() => ({
    limit: MEDIA_PAGE_SIZE,
    offset: mediaOffset.value
  }))
})
const media = computed(() => (mediaResponse.value && mediaResponse.value.items) ? mediaResponse.value.items : [])
const mediaShowingCount = computed(() => media.value.length)
watchEffect(() => {
  mediaTotal.value = Number((mediaResponse.value && mediaResponse.value.total) || 0)
})

const connection_node_1 = ref(null)
const connection_node_2 = ref(null)
const media_id = ref(null)
const order_num = ref('')
const content_desc = ref('')
const assignMessage = ref('')
const assignLoading = ref(false)


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
  const list = media.value || []
  return list.find((m) => m.media_id === Number(media_id.value))
})

const canSubmitAssign = computed(() => {
  return connection_node_1.value && connection_node_2.value && media_id.value && connection_node_1.value !== connection_node_2.value
})

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const submitUpload = async () => {
  uploadMessage.value = ''
  uploadLoading.value = true
  try {
    let mediaUrl = uploadForm.media
    let mediaType = '2'

    if (useFile.value && fileInput.value && fileInput.value.files && fileInput.value.files[0]) {
      const file = fileInput.value.files[0]
      mediaUrl = await readFileAsDataURL(file)
      if (file.type && file.type.startsWith('video')) mediaType = '1'
      else mediaType = '2'

      // include user-provided filename if present, otherwise original filename
      const sendName = (uploadForm.file_name && String(uploadForm.file_name).trim()) ? String(uploadForm.file_name).trim() : file.name
      await $fetch('/api/media/upload', { method: 'POST', body: { media_type: mediaType, media_url: mediaUrl, file_name: sendName } })
      uploadMessage.value = 'Media uploaded successfully.'
      Object.keys(uploadForm).forEach((k) => { uploadForm[k] = '' })
      if (fileInput.value) fileInput.value.value = null
      if (refreshMedia) { await refreshMedia() }
      uploadLoading.value = false
      return
    }

    await $fetch('/api/media/upload', { method: 'POST', body: { media_type: mediaType, media_url: mediaUrl } })
    uploadMessage.value = 'Media uploaded successfully.'
    Object.keys(uploadForm).forEach((k) => { uploadForm[k] = '' })
    if (fileInput.value) fileInput.value.value = null
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
    try {
      await $fetch('/api/connection', {
        method: 'POST',
        body: {
          node_1: Number(connection_node_1.value),
          node_2: Number(connection_node_2.value),
          wheelchair_accessible: !!wheelchair_accessible.value
        }
      })
    } catch (e) {
      const code = e?.data?.statusCode || e?.data?.status || null
      if (code === 409) {
      } else {
        throw e
      }
    }

    await $fetch('/api/connection-media', {
      method: 'POST',
      body: {
        connection_node_1: Number(connection_node_1.value),
        connection_node_2: Number(connection_node_2.value),
        media_id: Number(media_id.value),
        order_num: order_num.value ? Number(order_num.value) : null,
        content_desc: content_desc.value ? String(content_desc.value).trim() : null
      }
    })

    assignMessage.value = 'Media assigned to connection'
    order_num.value = ''
    content_desc.value = ''
  } catch (err) {
    assignMessage.value = String(err?.data?.message || err?.message || err)
  } finally {
    assignLoading.value = false
  }
}

const columns = computed(() => (media.value?.length ? Object.keys(media.value[0]) : []))

const { openGlobalMediaPreview } = useGlobalMediaPreview()
const { displayMediaUrl, isImageType, isVideoType } = useMediaChecks()
</script>

<template>
  <div>
    <AdminBackButton />
    <h1>Media management</h1>

    <section>
      <h2>Upload media</h2>
      <form @submit.prevent="submitUpload">
        <div>
          <label>
            <input type="radio" v-model="useFile" :value="false" /> Use link
          </label>
          <label>
            <input type="radio" v-model="useFile" :value="true" /> Upload file
          </label>
        </div>

        <div>
          <div v-if="!useFile">
            <label for="media">Media link (URL):</label>
            <input id="media" name="media" type="url" v-model="uploadForm.media" required />
          </div>

          <div v-else>
            <label for="file">Choose file:</label>
            <input id="file" ref="fileInput" type="file" accept="image/*,video/*" />
            <div>
              <label for="file_name">Save as (optional):</label>
              <input id="file_name" name="file_name" type="text" v-model="uploadForm.file_name" placeholder="custom-name.mp4 or leave blank" />
            </div>
          </div>
        </div>

        <button type="submit" :disabled="uploadLoading">{{ uploadLoading ? 'Uploading…' : 'Upload' }}</button>
      </form>
      <div v-if="uploadMessage">{{ uploadMessage }}</div>
    </section>

    <section>
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
            <option v-for="m in filteredMedia" :key="m.media_id" :value="m.media_id">{{ m.media_name || displayMediaUrl(m.media_url) }} — {{ m.media_id }}</option>
          </select>
        </div>

        <div v-if="selectedMediaObj">
          <h4>Preview</h4>
          <div v-if="isImageType(selectedMediaObj)">
            <img :src="selectedMediaObj.media_url" alt="preview" />
          </div>
          <div v-else-if="isVideoType(selectedMediaObj)">
            <video :src="selectedMediaObj.media_url" controls></video>
          </div>
          <div v-else>
            <a :href="selectedMediaObj.media_url" target="_blank">Open media</a>
          </div>
        </div>

        <div>
          <label><input type="checkbox" v-model="wheelchair_accessible" /> Is wheelchair accessible</label>
        </div>

        <div>
          <label>Media description (optional)</label>
          <textarea v-model="content_desc" rows="2" placeholder="Short description for this media on the connection"></textarea>
        </div>

        <p v-if="assignMessage">{{ assignMessage }}</p>

        <div>
          <button :disabled="assignLoading || !canSubmitAssign" @click="submitAssign">{{ assignLoading ? 'Saving…' : 'Create connection & assign media' }}</button>

        </div>
        <NuxtLink to="/admin/node">Add node</NuxtLink>


      </div>
    </section>
  </div>



  <div>
    <h1>media</h1>
    <div v-if="mediaError">Error loading media.</div>
    <div v-else-if="mediaPending">Loading...</div>
    <div v-else>
      <div>
        <span>Showing {{ mediaShowingCount }} / {{ mediaTotal }} media</span>
        <button :disabled="!mediaHasPrev || mediaPending" @click="prevMediaPage">Previous page</button>
        <button :disabled="!mediaHasNext || mediaPending" @click="nextMediaPage">Next page</button>
        <button :disabled="mediaPending" @click="refreshMedia">Refresh</button>
        <span>Page {{ mediaPage }} / {{ mediaTotalPages }}</span>
      </div>
      <table v-if="media && media.length" class="styled-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mediaItem, idx) in media" :key="idx">
            <td v-for="col in columns" :key="col">
              <template v-if="col === 'media_url'">
                <a :href="String(mediaItem[col] || '')" target="_self">{{ mediaItem[col] }}</a>
              </template>
              <template v-else>
                {{ mediaItem[col] }}
              </template>
            </td>
            <img
              v-if="mediaItem && isImageType(mediaItem)"
              :src="mediaItem.media_url"
              alt="Media"
              class="media-thumb media-thumb-hover"
              @click="openGlobalMediaPreview(mediaItem.media_url)"
            />
            <video v-else-if="mediaItem && isVideoType(mediaItem)" :src="mediaItem.media_url" controls class="media-thumb"></video>
            <td>
              <button @click="renameMedia(mediaItem.media_id)">Rename</button>
              <button @click="deleteMedia(mediaItem.media_url)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No media found.</div>
    </div>
  </div>
</template>
