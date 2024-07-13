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
      @start="setZooming()"
      @end="setZooming()"
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
import { storeToRefs } from 'pinia'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'
import type { Transform } from '@/types/d3'
import { zoomIdentity } from 'd3-zoom'
import { useDesignCanvasStore } from '@/stores/useDesignCanvasStore'

const transform = defineModel<Transform>('transform', { default: { x: 0, y: 0, k: 1 } })

const minZoomReached = toRef(() => transform.value.k <= 0.2)
const maxZoomReached = toRef(() => transform.value.k >= 2)

const { setZooming } = useDesignCanvasStore()

const { d3Zoom, d3Selection } = storeToRefs(useDesignCanvasStore())

function zoomTo(value: number) {
  if (d3Zoom.value && d3Selection.value) {
    d3Zoom.value.scaleTo(d3Selection.value, value)
  }
}

function zoomIn() {
  setZooming()

  transform.value.k += 0.1
  if (transform.value.k > 2) {
    transform.value.k = 2
  }
  zoomTo(transform.value.k)

  setTimeout(function () {
    setZooming()
  }, 200)
}

function zoomOut() {
  setZooming()

  transform.value.k -= 0.1
  if (transform.value.k < 0.2) {
    transform.value.k = 0.2
  }
  zoomTo(transform.value.k)

  setTimeout(function () {
    setZooming()
  }, 200)
}

function zoomBySlider() {
  zoomTo(transform.value.k)
}

function resetView() {
  setZooming()

  if (d3Zoom.value && d3Selection.value) {
    d3Zoom.value.transform(d3Selection.value, zoomIdentity)
  }

  setTimeout(function () {
    setZooming()
  }, 200)
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
