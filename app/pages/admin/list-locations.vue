<script setup>

const { data: locations, pending, error } = await useFetch('/api/node')

console.log('Locations data:', locations.value)

</script>




<template>
    <div>
        <h1>Welcome to NHS Wayfinder</h1>
        <p>Locations data: {{ locations }}</p>
    </div>
</template>