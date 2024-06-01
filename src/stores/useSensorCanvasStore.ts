import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSensorCanvasStore = defineStore('sensorCanvas', () => {
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

  return {
    isZoomingOrDragging,
    setZooming,
    setDragging
  }
})
