const MEDIA_PREVIEW_OPEN_EVENT = 'media-preview:open'

export function openGlobalMediaPreview(url: unknown) {
  if (typeof window === 'undefined') return
  const normalizedUrl = String(url || '')
  if (!normalizedUrl) return

  window.dispatchEvent(
    new CustomEvent(MEDIA_PREVIEW_OPEN_EVENT, {
      detail: { url: normalizedUrl },
    })
  )
}

export default function useGlobalMediaPreview() {
  return {
    openGlobalMediaPreview,
  }
}
