<script setup>
import { computed } from 'vue'
const { data: media, pending, error, refresh } = await useFetch('/api/media')
const columns = computed(() => (media?.value?.length ? Object.keys(media.value[0]) : []))

async function deleteMedia(media_url) {
  if (!confirm('Delete this media resource?')) return
  try {
    await $fetch('/api/media', { method: 'DELETE', body: { media_url } })
    await refresh()
  } catch (err) {
    console.error(err)
    alert('Failed to delete media resource')
  }
}

</script>





<template>
    <div>
        <div>
    <h1>Media Resources</h1>
    <div v-if="error">Error loading media resources.</div>
    <div v-else-if="pending">Loading...</div>
    <div v-else>
      <table v-if="media && media.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in media" :key="idx">
            <td v-for="col in columns" :key="col">{{ item[col] }}</td>
            <td>
              <button @click="deleteMedia(item.media_url)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No media resources found.</div>
    </div>
  </div>
    </div>
</template>