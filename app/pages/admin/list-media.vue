<script setup>

import { computed } from 'vue'
const { data: media, pending, error } = await useFetch('/api/media')
const columns = computed(() => (media?.value?.length ? Object.keys(media.value[0]) : []))


// Debugging logs media data and first media URL
//console.log('Media data:', media.value)
//console.log(media.value[0].media_url)

</script>



<template>
    <div>
        <h1>Welcome to NHS Wayfinder</h1>
        <NuxtLink to="/admin/add-media">Add Media</NuxtLink>
    </div>





  <div>
    <h1>media</h1>
    <div v-if="error">Error loading media.</div>
    <div v-else-if="pending">Loading...</div>
    <div v-else>
      <table v-if="media && media.length">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mediaItem, idx) in media" :key="idx">
            <td v-for="col in columns" :key="col"><a :href="mediaItem[col]">{{ mediaItem[col] }}</a></td>
            <img v-if="mediaItem" :src="mediaItem.media_url" alt="Media Image"/>
          </tr>
        </tbody>
      </table>
      <div v-else>No media found.</div>
    </div>
  </div>




</template>