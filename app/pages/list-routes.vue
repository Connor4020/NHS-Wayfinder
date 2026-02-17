<script setup>

const { data: path, pending, error } = await useFetch('/api/path')

console.log('Path data:', path.value)

</script>




<template>
    <div>
        <h1>Welcome to NHS Wayfinder</h1>
        <p>Path data: {{ path }}</p>
    </div>
</template>