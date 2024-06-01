import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowChartCanvasStore = defineStore('flowChartCanvasCanvas', () => {
  const isFlowChartCanvasZooming = ref(false)
  const isDraggingOrResizingSubProcess = ref(false)

  function setZooming(zooming: boolean) {
    isFlowChartCanvasZooming.value = zooming
  }

  function setDraggingOrResizingSubProcess() {
    isDraggingOrResizingSubProcess.value = !isDraggingOrResizingSubProcess.value
  }

  return {
    isFlowChartCanvasZooming,
    isDraggingOrResizingSubProcess,
    setZooming,
    setDraggingOrResizingSubProcess
  }
})
