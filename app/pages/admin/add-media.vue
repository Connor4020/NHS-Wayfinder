<script setup>

import { reactive, ref } from 'vue'

const form = reactive({ media: '' })
const message = ref('')
const columnsPending = ref(false)

async function submit() {
    // media type 1 = video, 2 = image
  try {
    await $fetch('/api/upload', { method: 'POST', body: { media_type: '2', media_url: form.media } })
    message.value = 'Media uploaded successfully.'
    Object.keys(form).forEach(k => form[k] = '')
  } catch (e) {
    message.value = e?.data?.statusMessage || 'Failed to upload media.'
  }
}

</script>

<template>
  <div>
    <h1>Add Media</h1>
    <p>This page will allow you to add media to the system.</p>
    <div v-if="columnsPending">Loading form…</div>
    <form v-else @submit.prevent="submit">
      <div>
        <label for="media">Select media link:</label>
        <input type="url" id="media" name="media" v-model="form.media" required />

      </div>
    

      <button type="submit">Upload</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>