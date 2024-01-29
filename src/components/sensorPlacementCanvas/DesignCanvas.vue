<script setup lang="ts">
import type { Sensor } from '@/types/sensor'
import SensorPanel from './SensorPanel.vue'
import { useSensorStore } from '@/stores/useSensor'
import SensorPlacementCanvas from './SensorPlacementCanvas.vue'
import { ref } from 'vue'

const transform = ref({ x: 0, y: 0, k: 1 })
const isSensorMode = ref(false)

let id = 0

function getSensorId() {
  return `sensor_${id++}`
}

const { addSensor } = useSensorStore()

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/desgin')

  const position = {
    x: (event.clientX - 7.5 - transform.value.x) / transform.value.k,
    y: (event.clientY - 15 - transform.value.y) / transform.value.k
  }

  const sensorId = getSensorId()
  const newSensor: Sensor = {
    id: sensorId,
    type,
    position,
    name: sensorId,
    dimension: {
      width: 15,
      height: 30
    },
    selected: false
  }

  addSensor(newSensor)
}
</script>

<template>
  <div class="design-canvas">
    <SensorPanel class="side-panel" v-model:isSensorMode="isSensorMode" />
    <SensorPlacementCanvas
      @dragover="onDragOver"
      @drop="onDrop"
      v-model:transform="transform"
      :is-sensor-mode="isSensorMode"
    />
  </div>
</template>

<style scoped>
.design-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}
.side-panel {
  position: absolute;
  top: 20%;
  left: 15px;
  z-index: 5;
}
</style>
