<template>
  <div class="d-flex align-center" style="width: 200px">
    <button @click="zoomOut" class="button" :disabled="minZoomReached">
      <IconZoomOut :color="minZoomReached ? '#BDBDBD' : ''" />
    </button>
    <v-slider
      v-model="zoom"
      min="0.2"
      max="2"
      color="#BDBDBD"
      :thumb-size="14"
      :hide-details="true"
      @update:modelValue="zoomBySlider"
      @start="setZooming(true)"
      @end="setZooming(false)"
    ></v-slider>
    <button @click="zoomIn" class="button" :disabled="maxZoomReached">
      <IconZoomIn :color="maxZoomReached ? '#BDBDBD' : ''" />
    </button>
  </div>
  <div class="d-flex button-group ml-4">
    <button class="icon-button with-right-border" title="reset the view" @click="resetView">
      <v-icon size="small" color="#66615b">mdi-image-filter-center-focus-weak</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'

const zoom = ref(1)
const minZoomReached = toRef(() => viewport.value.zoom <= 0.2)
const maxZoomReached = toRef(() => viewport.value.zoom >= 2)

const { zoomTo, viewport, setViewport } = useVueFlow()
const { setZooming } = useFlowChartCanvasStore()

async function zoomIn() {
  setZooming(true)
  zoom.value = zoom.value + 0.1
  if (zoom.value > 2) {
    zoom.value = 2
  }
  await zoomTo(zoom.value)
  setZooming(false)
}

async function zoomOut() {
  setZooming(true)
  zoom.value = zoom.value - 0.1
  if (zoom.value < 0.2) {
    zoom.value = 0.2
  }
  await zoomTo(zoom.value)
  setZooming(false)
}

function zoomBySlider() {
  zoomTo(zoom.value)
}

async function resetView() {
  setZooming(true)
  await setViewport({ zoom: 1, x: 0, y: 0 })
  setZooming(false)
}

watch(
  () => viewport.value,
  () => {
    zoom.value = viewport.value.zoom
  }
)
</script>

<style scoped>
.button {
  display: flex;
  align-items: center;
  padding: 5px, 0px;
}

.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
