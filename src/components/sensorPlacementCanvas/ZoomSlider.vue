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
    ></v-slider>
    <button @click="zoomIn" class="button" :disabled="maxZoomReached">
      <IconZoomIn :color="maxZoomReached ? '#BDBDBD' : ''" />
    </button>
  </div>
  <div class="d-flex button-group ml-4">
    <!-- <button class="icon-button with-right-border" title="undo">
        <v-icon size="small" color="#66615b">mdi-undo</v-icon>
      </button>
      <button class="icon-button with-right-border" title="redo">
        <v-icon size="small" color="#66615b">mdi-redo</v-icon>
      </button> -->
    <button class="icon-button with-right-border" title="reset the view" @click="resetView">
      <v-icon size="small" color="#66615b">mdi-border-radius</v-icon>
    </button>
    <button class="icon-button" title="delete">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'
import type { D3Zoom, D3Selection } from './SensorPlacementCanvas.vue'
import { zoomIdentity } from 'd3-zoom'

const zoom = defineModel<number>('zoom', { default: 1 })
const d3Zoom = defineModel<D3Zoom>('d3Zoom')
const d3Selection = defineModel<D3Selection>('d3Selection')

const minZoomReached = toRef(() => zoom.value <= 0.2)
const maxZoomReached = toRef(() => zoom.value >= 2)

function zoomTo(value: number) {
  if (d3Zoom.value && d3Selection.value) {
    d3Zoom.value.scaleTo(d3Selection.value, value)
  }
}

function zoomIn() {
  zoom.value = zoom.value + 0.1
  if (zoom.value > 2) {
    zoom.value = 2
  }
  zoomTo(zoom.value)
}

function zoomOut() {
  zoom.value = zoom.value - 0.1
  if (zoom.value < 0.2) {
    zoom.value = 0.2
  }
  zoomTo(zoom.value)
}

function zoomBySlider() {
  zoomTo(zoom.value)
}

function resetView() {
  if (d3Zoom.value && d3Selection.value) {
    d3Zoom.value.transform(d3Selection.value, zoomIdentity)
  }
}
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
