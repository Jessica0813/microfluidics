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
  </template>
  
  <script setup lang="ts">
  import { toRef } from 'vue'
  import IconZoomIn from '../icons/IconZoomIn.vue'
  import IconZoomOut from '../icons/IconZoomOut.vue'
  
  const zoom = defineModel<number>('zoom', { default: 1 })
  
  const minZoomReached = toRef(() => zoom.value <= 0.2)
  const maxZoomReached = toRef(() => zoom.value >= 2)
  
  function zoomIn() {
    zoom.value = zoom.value + 0.1
    if (zoom.value > 2) {
      zoom.value = 2
    }
  }
  
  function zoomOut() {
    zoom.value = zoom.value - 0.1
    if (zoom.value < 0.2) {
      zoom.value = 0.2
    }
  }
  
  function zoomBySlider() {
  }
  </script>
  
  <style scoped>
  .button {
    display: flex;
    align-items: center;
    padding: 5px, 0px;
  }
  </style>