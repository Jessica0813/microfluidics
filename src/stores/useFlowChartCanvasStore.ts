import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowChartCanvasStore = defineStore('flowChartCanvasCanvas', () => {
  const isFlowChartCanvasZooming = ref(false)

  function setZooming(zooming: boolean) {
    isFlowChartCanvasZooming.value = zooming
  }

  function getZooming() {
    return isFlowChartCanvasZooming.value
  }

  return {
    isFlowChartCanvasZooming,
    getZooming,
    setZooming
  }
})
