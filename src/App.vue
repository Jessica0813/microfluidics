<script setup lang="ts">
import FlowChartCanvas from './components/flowDesignCanvas/FlowChartCanvas.vue'
import DesignCanvas from './components/sensorPlacementCanvas/DesignCanvas.vue'
import DesignCanvasControl from './components/sensorPlacementCanvas/DesignCanvasControl.vue'
import ProcessEditMenuTest from './components/flowDesignCanvas/ProcessEditMenuTest.vue'
import { ref, provide } from 'vue'

const isDesignCanvasVisible = ref(true)
const designCanvasSize = ref('small')
function toggleDesignCanvasSize() {
  designCanvasSize.value = designCanvasSize.value === 'small' ? 'large' : 'small'
}

function toggleDesignCanvasVisibility() {
  isDesignCanvasVisible.value = !isDesignCanvasVisible.value
}
provide('DesignCanvasControl', {
  isDesignCanvasVisible,
  designCanvasSize,
  toggleDesignCanvasSize,
  toggleDesignCanvasVisibility
})
</script>

<template>
  <div id="app">
    <div class="canvas">
      <FlowChartCanvas />
      <div
        class="design-canvas elevation-1"
        :style="{
          width: designCanvasSize === 'small' ? '40%' : '80%',
          height: designCanvasSize === 'small' ? '40%' : '80%'
        }"
        v-show="isDesignCanvasVisible"
      >
        <DesignCanvas />
      </div>
      <div class="design-canvas-control">
        <DesignCanvasControl />
      </div>
      <process-edit-menu-test />
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
  bottom: 50px;
  right: 10px;
  z-index: 5;
}

.design-canvas-control {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 5;
}
</style>
