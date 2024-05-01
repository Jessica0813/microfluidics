<template>
  <div class="d-flex align-center" style="width: 200px">
    <button @click="zoomOut" class="button" :disabled="minZoomReached">
      <IconZoomOut :color="minZoomReached ? '#BDBDBD' : ''" />
    </button>
    <v-slider
      v-model="transform.k"
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
    <button class="icon-button with-right-border" title="reset the view" @click="resetView">
      <v-icon size="small" color="#66615b">mdi-image-filter-center-focus-weak</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'
import type { D3Zoom, D3Selection, Transform } from '@/types/d3'
import { zoomIdentity } from 'd3-zoom'
import { useSensorCanvasStore } from '@/stores/useSensorCanvasStore'

const transform = defineModel<Transform>('transform', { default: { x: 0, y: 0, k: 1 } })
const props = defineProps<{
  d3Zoom: D3Zoom | undefined
  d3Selection: D3Selection | undefined
}>()

const minZoomReached = toRef(() => transform.value.k <= 0.2)
const maxZoomReached = toRef(() => transform.value.k >= 2)

const { setZooming } = useSensorCanvasStore()

function zoomTo(value: number) {
  if (props.d3Zoom && props.d3Selection) {
    props.d3Zoom.scaleTo(props.d3Selection, value)
  }
}

function zoomIn() {
  setZooming(true)

  transform.value.k += 0.1
  if (transform.value.k > 2) {
    transform.value.k = 2
  }
  zoomTo(transform.value.k)

  setTimeout(function () {
    setZooming(false)
  }, 300)
}

function zoomOut() {
  setZooming(true)

  transform.value.k -= 0.1
  if (transform.value.k < 0.2) {
    transform.value.k = 0.2
  }
  zoomTo(transform.value.k)
  setTimeout(function () {
    setZooming(false)
  }, 10)
}

function zoomBySlider() {
  zoomTo(transform.value.k)
}

function resetView() {
  setZooming(true)

  if (props.d3Zoom && props.d3Selection) {
    props.d3Zoom.transform(props.d3Selection, zoomIdentity)
  }

  setTimeout(function () {
    setZooming(false)
  }, 10)
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
