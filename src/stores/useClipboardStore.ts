import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export enum ObjectType {
  NODE = 'NODE',
  SENSOR = 'SENSOR',
  NONE = 'NONE'
}

export const useClipboardStore = defineStore('clipboard', () => {
  const contents = ref<string[]>([])

  const contentsType = computed(() => {
    if (contents.value.length > 0) {
      return contents.value[0].includes('sensor') ? ObjectType.SENSOR : ObjectType.NODE
    }
    return ObjectType.NONE
  })

  function copyToClipboard(id: string[]) {
    contents.value = id
  }

  function pasteFromClipboard() {
    const value = Object.assign([], contents.value)
    contents.value = []
    return value
  }

  return { contentsType, copyToClipboard, pasteFromClipboard }
})
