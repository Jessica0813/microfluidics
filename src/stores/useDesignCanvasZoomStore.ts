import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDesignCanvasZoomStore = defineStore('designCanvasZoom', () => {
  const transform = ref({ x: 0, y: 0, k: 1 })

  function setTransform(newTransform: { x: number; y: number; k: number }) {
    transform.value = newTransform
  }

  return { transform, setTransform }
})
