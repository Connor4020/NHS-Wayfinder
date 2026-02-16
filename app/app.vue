<script setup>
useHead({
  title: "nhs wayfinder",
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { charset: "utf-8" },
  ],
  link: [
    { rel: "stylesheet", href: "/css/style.css" },
  ],
  script: [{ src: "/js/script.js", body: true }],
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
