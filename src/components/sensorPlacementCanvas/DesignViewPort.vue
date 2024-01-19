<script setup lang="ts">
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed } from 'vue'
import { useSensorStore } from '@/stores/useSensor'
import SensorWrapper from './SensorWrapper.vue'

const viewPort = ref<HTMLElement | null>(null)
const transform = ref({ x: 36, y: 38, k: 1 })

const { sensors } = useSensorStore()

onMounted(() => {
  if (!viewPort.value) return
  const d3Zoom = zoom<HTMLElement, any>()
    .scaleExtent([0.2, 2])
    .on('zoom', (event) => {
      transform.value = event.transform
    })
    .filter((event) => {
      if (event.type === 'dblclick') {
        return false
      }
      return true
    })

  const d3Selection = select(viewPort.value).call(d3Zoom)
  d3Selection.on('wheel.zoom')
})

const data = computed(() => {
  const width = 50 * transform.value.k
  const height = width
  const firstLineX = width
  let absyy = Math.abs(transform.value.y) % 50
  const firstLineY = absyy * transform.value.k

  const firstPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M0 ${transform.value.k * ((absyy % 10) + index * 10)} H ${width}`
  )
  let absxx = Math.abs(transform.value.x) % 50
  const secondLineX = absxx * transform.value.k
  const secondLineY = height
  const secondPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M${transform.value.k * ((absxx % 10) + index * 10)} 0 V ${height}`
  )
  return {
    width,
    height,
    firstLineX,
    firstLineY,
    firstPathGroup,
    secondLineX,
    secondLineY,
    secondPathGroup
  }
})
</script>

<template>
  <div
    ref="viewPort"
    style="width: 100%; height: 100%; background-color: #faf9f7; overflow: hidden"
  >
    <!-- <SensorPanel class="side-panel"/> -->
    <SensorWrapper
      v-for="sensor in sensors"
      :key="sensor.id"
      :sensor="sensor"
      :transform="transform"
    />
    <svg width="100%" height="100%">
      <pattern
        id="grid"
        x="0"
        y="0"
        :width="data.width"
        :height="data.height"
        patternUnits="userSpaceOnUse"
      >
        <g>
          <line
            x1="0"
            :y1="data.firstLineY"
            :x2="data.firstLineX"
            :y2="data.firstLineY"
            stroke="#E0E0E0"
            stroke-width="1"
          ></line>
          <path :d="data.firstPathGroup[0]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.firstPathGroup[1]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.firstPathGroup[2]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.firstPathGroup[3]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.firstPathGroup[4]" stroke="#E0E0E0" stroke-width="0.5"></path>
        </g>
        <g>
          <line
            :x1="data.secondLineX"
            y1="0"
            :x2="data.secondLineX"
            :y2="data.secondLineY"
            stroke="#E0E0E0"
            stroke-width="1"
          ></line>
          <path :d="data.secondPathGroup[0]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.secondPathGroup[1]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.secondPathGroup[2]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.secondPathGroup[3]" stroke="#E0E0E0" stroke-width="0.5"></path>
          <path :d="data.secondPathGroup[4]" stroke="#E0E0E0" stroke-width="0.5"></path>
        </g>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
</template>
