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
    ></v-slider>
    <button @click="zoomIn" class="button" :disabled="maxZoomReached">
      <IconZoomIn :color="maxZoomReached ? '#BDBDBD' : ''" />
    </button>
  </div>
  <div class="d-flex button-group ml-4">
    <button class="icon-button with-right-border" title="reset the view" @click="resetView">
      <v-icon size="small" color="#66615b">mdi-border-radius</v-icon>
    </button>
    <button
      class="icon-button with-right-border"
      title="delete"
      :class="hasSensorSelected ? '' : 'disable-hover'"
      :disabled="!hasSensorSelected"
      @click="onDeleteSelectedSensor"
    >
      <v-icon size="small" :color="hasSensorSelected ? '#66615b' : '#c2c2be'"
        >mdi-trash-can-outline</v-icon
      >
    </button>
    <SensorEditMenu
      :hasSensorSelected="hasSensorSelected"
      v-model="menu"
      :selected-sensor-id="selectedSensorId"
    />
    <button class="icon-button with-right-border" title="undo">
      <v-icon size="small" color="#66615b">mdi-undo</v-icon>
    </button>
    <button class="icon-button" title="redo">
      <v-icon size="small" color="#66615b">mdi-redo</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref } from 'vue'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'
import type { D3Zoom, D3Selection, Transform } from '@/types/d3'
import { zoomIdentity } from 'd3-zoom'
import { useSensorStore } from '@/stores/useSensorStore'
import SensorEditMenu from './SensorEditMenu.vue'

const { deleteSelectedSensor } = useSensorStore()

const transform = defineModel<Transform>('transform', { default: {x:0, y:0, k:1} })
const hasSensorSelected = defineModel<boolean>('hasSensorSelected', { default: false })
const props = defineProps<{
  d3Zoom: D3Zoom | undefined
  d3Selection: D3Selection | undefined
  selectedSensorId: string
}>()

const menu = ref(false)

const minZoomReached = toRef(() => transform.value.k <= 0.2)
const maxZoomReached = toRef(() => transform.value.k >= 2)

function zoomTo(value: number) {
  if (props.d3Zoom && props.d3Selection) {
    props.d3Zoom.scaleTo(props.d3Selection, value)
  }
}

function zoomIn() {
  transform.value.k += 0.1
  if (transform.value.k > 2) {
    transform.value.k = 2
  }
  zoomTo(transform.value.k)
}

function zoomOut() {
  transform.value.k -= 0.1
  if (transform.value.k < 0.2) {
    transform.value.k = 0.2
  }
  zoomTo(transform.value.k)
}

function zoomBySlider() {
  zoomTo(transform.value.k)
}

function resetView() {
  if (props.d3Zoom && props.d3Selection) {
    props.d3Zoom.transform(props.d3Selection, zoomIdentity)
  }
}

function onDeleteSelectedSensor() {
  hasSensorSelected.value = false
  deleteSelectedSensor()
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
