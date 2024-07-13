import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { D3Zoom, D3Selection } from '@/types/d3'

export const useDesignCanvasStore = defineStore('designCanvas', () => {
  const transform = ref({ x: 0, y: 0, k: 1 })
  const isCanvasZooming = ref(false)
  const isDraggingSensor = ref(false)
  const d3Zoom = ref<D3Zoom>()
  const d3Selection = ref<D3Selection>()

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

  function setD3Zoom(d3ZoomInstance: D3Zoom) {
    d3Zoom.value = d3ZoomInstance
  }

  function setD3Selection(d3SelectionInstance: D3Selection) {
    d3Selection.value = d3SelectionInstance
  }

  return {
    transform,
    isZoomingOrDragging,
    d3Zoom,
    d3Selection,
    setTransform,
    setZooming,
    setDragging,
    setD3Zoom,
    setD3Selection
  }
})
