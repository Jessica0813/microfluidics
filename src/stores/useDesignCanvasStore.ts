import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDesignCanvasStore = defineStore('designCanvas', () => {
  const transform = ref({ x: 0, y: 0, k: 1 })
  const isCanvasZooming = ref(false)
  const isDraggingSensor = ref(false)

  const isZoomingOrDragging = computed(() => {
    return isCanvasZooming.value || isDraggingSensor.value
  })

  function setZooming() {
    isCanvasZooming.value = !isCanvasZooming.value
  }

  function setDragging() {
    isDraggingSensor.value = !isDraggingSensor.value
  }

  function setTransform(newTransform: { x: number; y: number; k: number }) {
    transform.value = newTransform
  }

  return { transform, isZoomingOrDragging, setTransform, setZooming, setDragging }
})
