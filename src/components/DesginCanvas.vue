<script setup lang="ts">
// import * as d3 from 'd3'
import { zoom } from 'd3-zoom'
// import { pointer, select } from 'd3-selection'

import { ref, onMounted, computed } from 'vue'

const viewPort = ref<HTMLElement | null>(null)
const viewDiv = ref<HTMLElement | null>(null)
const scale = ref(1)

onMounted(() => {
  if (!viewDiv.value) return
  // const bbox = viewDiv.value.getBoundingClientRect()
  const d3Zoom = zoom<HTMLDivElement, any>()
    .scaleExtent([0.2, 2])
    .translateExtent([
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ])
    .on('zoom', (event) => {
      const { k } = event.transform
      scale.value = k
    })
  const d3Selection = select(viewPort.value).call(d3Zoom)
  d3Selection.on('wheel.zoom')
})

const data = computed(() => {
  const width = 50 * scale.value
  const height = width
  const firstLineX = width
  const firstLineY = 38 * scale.value
  const firstPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M0 ${scale.value * (8 + index * 10)} H ${width}`
  )
  const secondLineX = 36 * scale.value
  const secondLineY = height
  const secondPathGroup = Array.from(
    { length: 5 },
    (_, index) => `M${scale.value * (6 + index * 10)} 0 V ${height}`
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
  <div ref="viewDiv" style="width: 100%; height: 100%; background-color: #faf9f7">
    <svg ref="viewPort" width="100%" height="100%">
      <!-- Define a pattern with a grid -->
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

      <!-- Use the pattern to fill a rectangle -->
      <rect width="100%" height="100%" fill="url(#grid)" />

      <!-- Add another element (circle) -->
    </svg>
  </div>
</template>
