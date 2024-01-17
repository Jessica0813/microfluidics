<template>
  <div ref="container" style="width: 100%; height: 100%; overflow: clip">
    <svg ref="svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="smallGrid"
          :width="background.smallGridLength"
          :height="background.smallGridLength"
          patternUnits="userSpaceOnUse"
        >
          <path :d="background.smallGridPattern" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
        </pattern>

        <pattern
          id="grid"
          :width="background.bigGridLength"
          :height="background.bigGridLength"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
          <path :d="background.bigGridPattern" fill="none" stroke="#E0E0E0" stroke-width="1" />
        </pattern>
      </defs>

      <!-- Use the big grid pattern to fill the entire SVG -->
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'

const container = ref<HTMLElement | null>(null)
const svg = ref<HTMLElement | null>(null)
const transform = ref({ x: 0, y: 0, k: 1 })

const background = computed(() => {
  const smallGridLength = 10 * transform.value.k
  const bigGridLength = 50 * transform.value.k

  return {
    smallGridLength: 10 * transform.value.k,
    smallGridPattern: `M ${smallGridLength} 0 L 0 0 0 ${smallGridLength}`,
    bigGridLength: bigGridLength,
    bigGridPattern: `M ${bigGridLength} 0 L 0 0 0 ${bigGridLength}`
  }
})
onMounted(() => {
  if (!container.value || !svg.value) return

  const d3Zoom = zoom<HTMLElement, any>()
    .scaleExtent([0.2, 2])
    .on('zoom', (event) => {
      transform.value = event.transform
      console.log(transform)
      if (!container.value || !svg.value) return
      container.value.style.transform = `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.k})`
    })

  const d3Selection = select(container.value).call(d3Zoom)
  d3Selection.on('wheel.zoom')
})
</script>
