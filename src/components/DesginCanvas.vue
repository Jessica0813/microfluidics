<script setup lang="ts">
import * as d3 from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import { ref, onMounted, computed } from 'vue'

const viewPort = ref<HTMLElement | null>(null)
const scale = ref(1)
const test = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!viewPort.value) return
  // const bbox = viewDiv.value.getBoundingClientRect()
  const d3Zoom = zoom<HTMLDivElement, any>()
    .scaleExtent([0.2, 2])
    .translateExtent([
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    ])
    .on('zoom', (event) => {
      const { k } = event.transform
      console.log(event.transform)
      scale.value = k
    })
  const d3Selection = select(viewPort.value).call(d3Zoom)
  d3Selection.on('wheel.zoom')

  if (!test.value) return
  const d3Drag = drag()
  const selected = select(test.value)
  let startOffsetX: number
  let startOffsetY: number
  d3Drag.on('start', (event: D3DragEvent<HTMLElement, any, any>) => {
    if (!test.value) return
    startOffsetX = event.x - test.value.getBoundingClientRect().x
    startOffsetY = event.y - test.value.getBoundingClientRect().y
  })
  d3Drag.on('drag', (event: D3DragEvent<HTMLElement, any, any>) => {
    if (!test.value) return
    // test.value.style.transform = `translate(${event.x - startOffsetX}px, ${event.y- startOffsetY}px)`
    test.value.style.left = `${event.x - startOffsetX}px`
    test.value.style.top = `${event.y - startOffsetY}px`
  })
  d3Drag.on('end', () => {
    console.log('end')
    if (!test.value) return
    console.log(test.value)
    console.log(test.value.getBoundingClientRect())
  })
  selected.call(d3Drag)
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

const value = computed(() => {
  const width = 100 * scale.value
  const height = 100 * scale.value
  const top = 100 * scale.value
  const left = 100 * scale.value

  return {
    width,
    height,
    top,
    left
  }
})
</script>

<template>
  <div
    ref="viewPort"
    style="width: 100%; height: 100%; background-color: #faf9f7; overflow: hidden"
  >
    <div
      ref="test"
      draggable="true"
      :style="{
        width: `${value.width}px`,
        height: `${value.height}px`,
        left: `${value.left}px`,
        top: `${value.top}px`,
        backgroundColor: 'grey',
        position: 'absolute'
      }"
    ></div>
    <div style="width: 200px; position: absolute; z-index: 1">
      <v-slider v-model="scale" min="0.2" :max="2"></v-slider>
    </div>
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
