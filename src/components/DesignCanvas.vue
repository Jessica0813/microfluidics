<script setup lang="ts">
import type { Sensor } from '@/types/sensor'
import SensorPanel from '@/components/SensorPanel.vue'
import { useSensorStore } from '@/stores/useSensor'
import DesignViewPort from '@/components/DesignViewPort.vue'

let id = 0;

function getSensorId() {
  return `sensor_${id++}`
}

const { addSensor, findSensor } = useSensorStore()

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  console.log(111)
}

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/desgin')
  console.log(type)

//   if (viewPort.value === null) return
//   const { left, top } = viewPort.value.getBoundingClientRect()

  const position = {
    x: event.clientX - 25,
    y: event.clientY - 25
  }

  const sensorId = getSensorId()
  const newSensor: Sensor = {
    id: sensorId,
    type,
    position,
    name: sensorId,
    dimension: {
      width: 50,
      height: 50
    }
  }

  addSensor(newSensor)

  // align node position after drop, so it's centered to the mouse
  // nextTick(() => {
  //   const sensor = findSensor(newSensor.id)
  //   if (sensor === undefined) return
  //   const stop = watch(
  //     () => sensor.dimension,
  //     (dimension) => {
  //       if (dimension.width > 0 && dimension.height > 0) {
  //         sensor.position = {
  //           x: sensor.position.x - sensor.dimension.width / 2,
  //           y: sensor.position.y - sensor.dimension.height / 2
  //         }
  //         stop()
  //       }
  //     },
  //     { deep: true, flush: 'post' }
  //   )
  // })
}
</script>

<template>
    <div class="design-canvas"     
    @dragover="onDragOver"
    @drop="onDrop" >
        <SensorPanel class="side-panel"/>
        <DesignViewPort />
    </div>
</template>

    <!-- <div style="width: 200px; position: absolute; z-index: 1">
      <v-slider v-model="scale" min="0.2" :max="2"></v-slider>
    </div> -->

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
  