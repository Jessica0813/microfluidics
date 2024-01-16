<script setup lang="ts">
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed } from 'vue'
import { useSensorStore } from '@/stores/useSensor'
import SensorWrapper from '@/components/SensorWrapper.vue'

const viewPort = ref<HTMLElement | null>(null)
const viewSvg = ref<HTMLElement | null>(null)
const scale = ref(1)
const xx = ref<number>(36)
const yy = ref<number>(38)

const { sensors } = useSensorStore()

onMounted(() => {
  if (!viewPort.value) return
  // const bbox = viewDiv.value.getBoundingClientRect()
  const d3Zoom = zoom<HTMLDivElement, any>()
    .scaleExtent([0.2, 2])
    .on('zoom', (event) => {
      const { k, x, y } = event.transform
      scale.value = k
      xx.value = x
      yy.value = y
    })
  const d3Selection = select(viewPort.value).call(d3Zoom)
  d3Selection.on('wheel.zoom')
})

const data = computed(() => {
  const width = 50 * scale.value
  const height = width
  const firstLineX = width
  let absyy = Math.abs(yy.value) % 50

  if (absyy === 0) {
    absyy = 1
  }
  const firstLineY = absyy * scale.value

  const firstPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M0 ${scale.value * ((absyy % 10) + index * 10)} H ${width}`
  )
  let absxx = Math.abs(xx.value) % 50
  if (absxx === 0) {
    absxx = 1
  }
  const secondLineX = absxx * scale.value
  const secondLineY = height
  const secondPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M${scale.value * ((absxx % 10) + index * 10)} 0 V ${height}`
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
    <SensorWrapper
      v-for="sensor in sensors"
      :key="sensor.id"
      :sensor= "sensor"
    />
    <!-- <div style="width: 200px; position: absolute; z-index: 1">
      <v-slider v-model="scale" min="0.2" :max="2"></v-slider>
    </div> -->
    <svg ref="viewSvg" width="100%" height="100%">
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
