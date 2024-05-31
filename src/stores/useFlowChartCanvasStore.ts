import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowChartCanvasStore = defineStore('flowChartCanvasCanvas', () => {
  const isFlowChartCanvasZooming = ref(false)
  const isDraggingOrResizingSubProcess = ref(false)

  function setZooming(zooming: boolean) {
    isFlowChartCanvasZooming.value = zooming
  }

  function getZooming() {
    return isFlowChartCanvasZooming.value
  }

  function setDraggingOrResizingSubProcess() {
    isDraggingOrResizingSubProcess.value = !isDraggingOrResizingSubProcess.value
  }

  function getDraggingOrResizingSubProcess() {
    return isDraggingOrResizingSubProcess.value
  }

  return {
    isFlowChartCanvasZooming,
    getZooming,
    setZooming,
    getDraggingOrResizingSubProcess,
    setDraggingOrResizingSubProcess
  }
})
