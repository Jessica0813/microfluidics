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
import { ref, onMounted, watch } from 'vue'
import { zoom } from 'd3-zoom'
// import { zoomIdentity } from 'd3'
import { select } from 'd3-selection'
import { useSensorStore } from '@/stores/useSensorStore'
// import { drag } from 'd3-drag'
// import type { D3DragEvent } from 'd3-drag'
import type { Sensor } from '@/types/sensor'
import ZoomSlider from './ZoomSlider.vue'
import { useDrop } from '@/composables/useDrop'
import SensorPanel from './SensorPanel.vue'
import type { D3Zoom, D3Selection } from '@/types/d3'
import {
  d3UpperLeftResize,
  d3UpperRightResize,
  d3LowerLeftResize,
  d3LowerRightResize,
  d3Drag
} from '@/composables/useSensorDragandResize'
import type { EditedSensor } from '@/composables/useSensorDragandResize'

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
const editedSensor = ref<EditedSensor>({
  id: '',
  position: { x: 0, y: 0 },
  radius: 0
})

watch(
  () => editedSensor.value,
  (newValue) => {
    editSensor(newValue.id, {
      position: {
        x: newValue.position.x,
        y: newValue.position.y
      },
      radius: newValue.radius
    })
  },
  { deep: true }
)

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
    const sensorRect = sensorGroup.selectAll('.sensor-rect').data((d) => [d])
    const upperLeftDot = sensorGroup.selectAll('.upper-left-dot').data((d) => [d])
    const upperRightDot = sensorGroup.selectAll('.upper-right-dot').data((d) => [d])
    const lowerLeftDot = sensorGroup.selectAll('.lower-left-dot').data((d) => [d])
    const lowerRightDot = sensorGroup.selectAll('.lower-right-dot').data((d) => [d])

    // Enter
    const sensorEnter = sensorGroup
      .enter()
      .append('g')
      .attr('class', 'sensor-group')
      .attr('id', (sensor) => `sensor-${sensor.id}`)

    // Append Circle
    sensorEnter
      .append('circle')
      .attr('class', 'sensor')
      .attr('r', (sensor) => sensor.radius)
      .attr('cx', (sensor) => sensor.position.x)
      .attr('cy', (sensor) => sensor.position.y)
      .attr('fill', (sensor) => (sensor.selected ? '#007bff' : '#BDBDBD'))

    // add rect around circle
    sensorEnter
      .append('rect')
      .attr('class', 'sensor-rect')
      .attr('x', (sensor) => sensor.position.x - sensor.radius)
      .attr('y', (sensor) => sensor.position.y - sensor.radius)
      .attr('width', (sensor) => sensor.radius * 2)
      .attr('height', (sensor) => sensor.radius * 2)
      .attr('fill', 'none')
      .attr('stroke', '#BDBDBD')
      .attr('stroke-width', 1)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // add four dots around the rect corner

    //add hover effect
    sensorEnter
      .append('circle')
      .attr('class', 'upper-left-dot')
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('r', 4)
      .attr('fill', '#BDBDBD')
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .call(d3UpperLeftResize(editedSensor.value))

    sensorEnter
      .append('circle')
      .attr('class', 'upper-right-dot')
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3UpperRightResize(editedSensor.value))

    sensorEnter
      .append('circle')
      .attr('class', 'lower-left-dot')
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3LowerLeftResize(editedSensor.value))

    sensorEnter
      .append('circle')
      .attr('class', 'lower-right-dot')
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3LowerRightResize(editedSensor.value))

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

    sensorEnter.call(d3Drag(editedSensor.value)).on('click', (event, sensor) => {
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
      .attr('fill', (sensor) => (sensor.selected ? '#007bff' : '#BDBDBD'))

    sensorText
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('dy', (sensor) => -sensor.radius - 5)
      .text((sensor) => sensor.name)

    sensorRect
      .attr('x', (sensor) => sensor.position.x - sensor.radius)
      .attr('y', (sensor) => sensor.position.y - sensor.radius)
      .attr('width', (sensor) => sensor.radius * 2)
      .attr('height', (sensor) => sensor.radius * 2)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    upperLeftDot
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // .call(d3UpperLeftResize(editedSensor.value))

    upperRightDot
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // .call(d3UpperRightResize(editedSensor.value))

    lowerLeftDot
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // .call(d3LowerLeftResize(editedSensor.value))

    lowerRightDot
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // .call(d3LowerRightResize(editedSensor.value))

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
