<script setup lang="ts">
import { ref } from 'vue'
import FlowChartCanvas from './components/flowDesignCanvas/FlowChartCanvas.vue'
import DesignCanvas from './components/designCanvas/DesignCanvas.vue'

const isDesignCanvasVisible = ref(true)
const designCanvasSize = ref('small')
</script>

<template>
  <div id="app">
    <div class="canvas">
      <FlowChartCanvas />
      <div
        class="design-canvas"
        :style="{
          width: isDesignCanvasVisible ? (designCanvasSize === 'small' ? '40%' : '80%') : '50px',
          height: isDesignCanvasVisible ? (designCanvasSize === 'small' ? '40%' : '80%') : '50px'
        }"
      >
        <DesignCanvas
          v-model:design-canvas-size="designCanvasSize"
          v-model:is-design-canvas-visible="isDesignCanvasVisible"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  position: relative;
}

.design-canvas {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 5;
  transition:
    width 0.5s,
    height 0.5s;
}
</style>
