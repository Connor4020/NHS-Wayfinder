<script setup>
import { onMounted, ref } from 'vue'

const containerId = 'google-translate-element'
const loading = ref(false)
const loadError = ref(false)

const hasWidget = () => {
  const host = document.getElementById(containerId)
  return !!host && host.childElementCount > 0
}

const initializeWidget = () => {
  if (hasWidget()) return true
  if (window.google?.translate?.TranslateElement) {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        autoDisplay: false
      },
      containerId
    )
    return true
  }
  return false
}

const injectScript = () =>
  new Promise((resolve, reject) => {
    const existing = document.getElementById('google-translate-script')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      if (window.google?.translate?.TranslateElement) resolve(null)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-translate-script'
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })

onMounted(async () => {
  if (typeof window === 'undefined') return

  loading.value = true
  loadError.value = false
  window.googleTranslateElementInit = () => initializeWidget()

  try {
    await injectScript()
    initializeWidget()
  } catch (_) {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <ClientOnly>
    <div class="translate-wrapper">
      <div :id="containerId" class="translate-target" />
      <span v-if="loadError" class="translate-status translate-error">Translation failed to load.</span>
      <span v-else-if="loading" class="translate-status">Loading translations…</span>
    </div>
  </ClientOnly>
</template>

<style scoped>
.translate-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.translate-target :deep(.goog-te-gadget) {
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0 !important;
  color: transparent !important;
}

.translate-target :deep(.goog-te-gadget > span) {
  display: none !important;
}

.translate-target :deep(.goog-te-gadget::before) {
  content: 'Powered by Google Translate';
  display: block;
  font-size: 10px;
  color: #c0c0c0; /* Light grey text */
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.translate-target :deep(.goog-te-combo) {
  margin: 0 !important;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #cbd2d9;
  background: #ffffff;
  color: #1b1f23;
  font-size: 14px !important;
  min-width: 170px;
  cursor: pointer;
}

.translate-status {
  font-size: 14px;
  color: inherit;
}

.translate-error {
  color: #b42318;
}
</style>
