<template>
  <div
    style="
      width: 100%;
      height: 100%;
      overflow: clip;
      background-color: #faf9f7;
      border: 1px solid #dfdfdf;
      border-radius: 4px;
    "
    @click="removeSelectedSensor"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <SensorPanel class="sensor-panel" />
    <div class="top-bar">
      <ZoomSlider
        v-model:transform="transform"
        :d3-zoom="d3Zoom"
        :d3-selection="d3Selection"
        v-model:hasSensorSelected="hasSensorSelected"
        :selected-sensor-id="selectedSensorId"
      />
    </div>
    <svg ref="svg" width="100%" height="100%">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
        </pattern>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect
            width="100%"
            height="100%"
            fill="url(#smallGrid)"
            stroke="#E0E0E0"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" x="0" y="0" fill="url(#grid)" />
      <g id="canvas"></g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { useSensorStore } from '@/stores/useSensorStore'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import type { Sensor } from '@/types/sensor'
import ZoomSlider from './ZoomSlider.vue'
import { useDrop } from '@/composables/useDrop'
import SensorPanel from './SensorPanel.vue'
import type { D3Zoom, D3Selection } from '@/types/d3'
import type { DesignCanvasControl } from '@/types/designCanvasControl'
import { defaultDesignCanvasControl } from '@/types/designCanvasControl'
import { inject } from 'vue'

const { designCanvasSize, toggleDesignCanvasSize } =
  inject<DesignCanvasControl>('DesignCanvasControl') || defaultDesignCanvasControl

const {
  sensors,
  selectedSensor,
  editSensor,
  onSelectSensor,
  removeAllSelectedSensors,
  addSensor,
  getSensorId
} = useSensorStore()
const svg = ref<HTMLElement | null>(null)
const transform = ref({ x: 0, y: 0, k: 1 })
const d3Zoom = ref<D3Zoom>()
const d3Selection = ref<D3Selection>()
const hasSensorSelected = ref(selectedSensor.length > 0)
const selectedSensorId = ref(selectedSensor[0]?.id || '')

const d3Drag = drag<SVGGElement, Sensor, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
d3Drag.on('start', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
  startOffsetX = event.x - event.subject.position.x
  startOffsetY = event.y - event.subject.position.y
})
d3Drag.on('drag', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
  select(`#sensor-${event.subject.id}`)
    .select('.sensor')
    .attr('cx', event.x - startOffsetX)
    .attr('cy', event.y - startOffsetY)
  select(`#sensor-${event.subject.id}`)
    .select('.sensor-label')
    .attr('x', event.x - startOffsetX)
    .attr('y', event.y - startOffsetY)
})
d3Drag.on('end', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
  editSensor(event.subject.id, {
    position: {
      x: event.x - startOffsetX,
      y: event.y - startOffsetY
    }
  })
})

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(event: any) {
  if (!svg.value) return
  const left = svg.value.getBoundingClientRect().left
  const top = svg.value.getBoundingClientRect().top
  useDrop(left, top, event, transform.value, getSensorId(), addSensor)

  //wait 1 second
  setTimeout(() => {
    if (designCanvasSize.value === 'large') {
      toggleDesignCanvasSize()
    }
  }, 1000)
}

function removeSelectedSensor() {
  removeAllSelectedSensors()
  hasSensorSelected.value = false
  selectedSensorId.value = ''
}

onMounted(() => {
  if (!svg.value) return
  d3Selection.value = select(svg.value)
  const patternGrid = d3Selection.value.select('#grid')
  const patternInnerGrid = d3Selection.value.select('#smallGrid')
  const canvas = d3Selection.value.select('#canvas')

  d3Zoom.value = zoom<HTMLElement, any>()
    .scaleExtent([0.2, 2])
    .on('zoom', (event) => {
      transform.value = event.transform

      const transform10 = event.transform.k * 10
      const transform50 = transform10 * 5
      patternGrid
        .attr('x', event.transform.x % transform50)
        .attr('y', event.transform.y % transform50)
        .attr('width', transform50)
        .attr('height', transform50)
      patternInnerGrid.attr('width', transform10).attr('height', transform10)

      canvas.attr('transform', event.transform)
    })
    .filter((event) => {
      if (event.type === 'dblclick') {
        return false
      }
      return true
    })

  d3Selection.value.call(d3Zoom.value).on('wheel.zoom')

  const updateCirclesWithText = () => {
    const sensorGroup = canvas.selectAll<SVGGElement, Sensor>('.sensor-group').data(sensors)
    const sensor = sensorGroup.selectAll('.sensor').data((d) => [d])
    const sensorText = sensorGroup.selectAll('.sensor-label').data((d) => [d])

    // Enter
    const sensorEnter = sensorGroup.enter().append('g').attr('class', 'sensor-group')

    // Append Circle
    sensorEnter
      .append('circle')
      .attr('class', 'sensor')
      .attr('r', (sensor) => sensor.radius)
      .attr('cx', (sensor) => sensor.position.x)
      .attr('cy', (sensor) => sensor.position.y)
      .attr('fill', (sensor) => (sensor.selected ? 'blue' : 'grey'))

    // Append Text
    sensorEnter
      .append('text')
      .attr('class', 'sensor-label')
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('dy', (sensor) => -sensor.radius - 5) // Adjust the text position based on your preference
      .attr('text-anchor', 'middle') // Center the text on the circle
      .style('font-size', 12)
      .text((sensor) => sensor.name)

    sensorEnter
      .attr('id', (sensor) => `sensor-${sensor.id}`)
      .call(d3Drag)
      .on('click', (event, sensor) => {
        event.stopPropagation()
        hasSensorSelected.value = true
        onSelectSensor(sensor.id)
        selectedSensorId.value = sensor.id
      })

    // Update
    sensor
      .attr('r', (sensor) => sensor.radius)
      .attr('cx', (sensor) => sensor.position.x)
      .attr('cy', (sensor) => sensor.position.y)
      .attr('fill', (sensor) => (sensor.selected ? 'blue' : 'grey'))

    sensorText
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('dy', (sensor) => -sensor.radius - 5)
      .text((sensor) => sensor.name)

    // Exit
    sensorGroup.exit().remove()

    // // Apply D3 drag behavior
    // sensorGroup.call(d3Drag).on('click', (event, sensor) => {
    //   event.stopPropagation()
    //   onSelectSensor(sensor.id)
    // })
  }

  // Watch for changes in the sensors array and update the visualization
  watch(() => sensors, updateCirclesWithText, { deep: true })

  // Initial update
  updateCirclesWithText()

  // onBeforeUnmount(() => {
  //   canvas.selectAll('.sensor-group').on('.drag', null)
  //   canvas.selectAll('.sensor-group').data(sensors).remove()
  //   if (d3Zoom.value && d3Selection.value) {
  //     d3Zoom.value.transform(d3Selection.value, zoomIdentity)
  //   }
  // })
})
</script>

<style scoped>
.sensor-panel {
  position: absolute;
  top: 35%;
  left: 10px;
  z-index: 5;
  cursor: pointer;
}
</style>
