import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSensorCanvasStore = defineStore('sensorCanvas', () => {
  const isCanvasZooming = ref(false)

  function setZooming(zooming: boolean) {
    isCanvasZooming.value = zooming
  }

  function getZooming() {
    return isCanvasZooming.value
  }

  return {
    isCanvasZooming,
    getZooming,
    setZooming
  }
})
