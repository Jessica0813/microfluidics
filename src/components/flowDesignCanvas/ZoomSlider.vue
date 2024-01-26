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
    <button
      class="icon-button"
      :class="hasSelectedElements ? '' : 'disable-hover'"
      title="delete"
      @click="deleteSelectedElements"
      :disabled="!hasSelectedElements"
    >
      <v-icon size="small" :color="hasSelectedElements ? '#66615b' : '#c2c2be'"
        >mdi-trash-can-outline</v-icon
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'

const { zoomTo, viewport, getSelectedElements, removeEdges, removeNodes, setViewport } =
  useVueFlow()
const zoom = ref(1)

const minZoomReached = toRef(() => viewport.value.zoom <= 0.2)
const maxZoomReached = toRef(() => viewport.value.zoom >= 2)

const hasSelectedElements = toRef(() => getSelectedElements.value.length > 0)

watch(
  () => viewport.value,
  () => {
    zoom.value = viewport.value.zoom
  }
)

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

function deleteSelectedElements() {
  getSelectedElements.value.forEach((element) => {
    if (element.type === 'custom') {
      removeEdges([element.id])
    } else if (
      element.type === 'condition' ||
      element.type === 'process' ||
      element.type === 'schedule'
    ) {
      removeNodes([element.id])
    }
  })
}

function resetView() {
  setViewport({ zoom: 1, x: 0, y: 0 })
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
