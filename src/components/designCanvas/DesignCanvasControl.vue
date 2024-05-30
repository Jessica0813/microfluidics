<template>
  <div class="vertical-button-group elevation-1">
    <deletable-drop-down :items="layer" v-model:selected="selected" />
    <ZoomSlider v-model:transform="transform" :d3-zoom="d3Zoom" :d3-selection="d3Selection" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DeletableDropDown from '../general/DeletableDropDown.vue'
import ZoomSlider from './ZoomSlider.vue'
import type { D3Zoom, D3Selection, Transform } from '@/types/d3'

defineProps<{
  d3Zoom: D3Zoom | undefined
  d3Selection: D3Selection | undefined
}>()
const transform = defineModel<Transform>('transform', { default: { x: 0, y: 0, k: 1 } })

const selected = ref('')
const layer = ref(['layer 1', 'layer 2', 'layer 3'])
</script>

<style scoped>
.vertical-button-group {
  display: flex;
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
  height: 100%;
}
</style>
