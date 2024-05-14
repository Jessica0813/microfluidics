import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useClipboardStore = defineStore('clipboard', () => {
  const contents = ref<string[]>([])

  function copyToClipboard(id: string[]) {
    contents.value = id
  }

  function pasteFromClipboard() {
    const value = Object.assign([], contents.value)
    contents.value = []
    return value
  }

  return { copyToClipboard, pasteFromClipboard }
})
