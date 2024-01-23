<template>
  <div style="width: 100%; height: 100%; overflow: clip; background-color: #faf9f7">
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
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import { useSensorStore } from '@/stores/useSensor'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import type { Sensor } from '@/types/sensor'
import ZoomSlider from './ZoomSlider.vue'

const { sensors, editSensor } = useSensorStore()
const svg = ref<HTMLElement | null>(null)
const transform = ref({ x: 0, y: 0, k: 1 })

const d3Drag = drag<SVGRectElement, Sensor, any>()
let startOffsetX: number = 1
let startOffsetY: number = 1
d3Drag.on('start', (event: D3DragEvent<SVGRectElement, Sensor, any>) => {
  startOffsetX = event.x - event.subject.position.x
  startOffsetY = event.y - event.subject.position.y
})
d3Drag.on('drag', (event: D3DragEvent<SVGRectElement, Sensor, any>) => {
  select(`#sensor-${event.subject.id}`).attr('x', event.x - startOffsetX).attr('y', event.y - startOffsetY)
})
d3Drag.on('end', (event: D3DragEvent<SVGRectElement, Sensor, any>) => {
  editSensor(event.subject.id, {
    position: {
      x: event.x - startOffsetX,
      y: event.y - startOffsetY
    }
  })
})

onMounted(() => {
  if (!svg.value) return
  const d3Selection = select(svg.value)
  const patternGrid = d3Selection.select('#grid')
  const patternInnerGrid = d3Selection.select('#smallGrid')
  const canvas = d3Selection.select('#canvas')

  const d3Zoom = zoom<HTMLElement, any>()
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

  d3Selection.call(d3Zoom).on('wheel.zoom')

  // Function to update rectangles
  const updateRectangles = () => {
    const sensorRectangles = canvas.selectAll('.sensor').data(sensors)

    sensorRectangles
      .enter()
      .append('rect')
      .attr('class', 'sensor')
      .attr('width', 15)
      .attr('height', 30)
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'grey')
      .attr('id', (sensor) => `sensor-${sensor.id}`)
      .call(d3Drag)
  }

  // Watch for changes in the sensors array and update the visualization
  watch(() => sensors, updateRectangles, { deep: true })

  // Initial update
  updateRectangles()

  onBeforeUnmount(() => {
    canvas.selectAll('.sensor').on('.drag', null)
    canvas.selectAll('.sensor').data(sensors).remove()
  })
})

</script>
