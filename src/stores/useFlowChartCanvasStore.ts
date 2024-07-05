import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowChartCanvasStore = defineStore('flowChartCanvasCanvas', () => {
  const isFlowChartCanvasZooming = ref(false)
  const isDraggingOrResizingSubProcess = ref(false)
  const showPatternedBackground = ref(true)

  function setZooming(zooming: boolean) {
    isFlowChartCanvasZooming.value = zooming
  }

  function setDraggingOrResizingSubProcess() {
    isDraggingOrResizingSubProcess.value = !isDraggingOrResizingSubProcess.value
  }

  function toggleShowPatternedBackground() {
    showPatternedBackground.value = !showPatternedBackground.value
  }

  return {
    isFlowChartCanvasZooming,
    isDraggingOrResizingSubProcess,
    showPatternedBackground,
    setZooming,
    setDraggingOrResizingSubProcess,
    toggleShowPatternedBackground
  }
})
