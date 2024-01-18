<script setup lang="ts">
import FlowChartCanvas from './components/FlowChartCanvas.vue'
import DesignCanvas from './components/DesignCanvas.vue'
import CanvasSwitch from './components/CanvasSwitch.vue'
import RightSideBar from './components/RightSideBar.vue'
import { ref } from 'vue'

const isFlowDesignCanvasOpen = ref(true)
function onFlowDesignClick() {
  isFlowDesignCanvasOpen.value = true
}
function onSensorPlacementClick() {
  isFlowDesignCanvasOpen.value = false
}
</script>

<template>
  <div id="app">
    <div class="canvas">
      <div class="switch">
        <CanvasSwitch
          :is-flow-design-canvas-open="isFlowDesignCanvasOpen"
          @on-flow-design-click="onFlowDesignClick"
          @on-sensor-placement-click="onSensorPlacementClick"
        />
      </div>
      <div class="right-side-bar">
        <RightSideBar />
      </div>
      <FlowChartCanvas v-if="isFlowDesignCanvasOpen" />
      <DesignCanvas v-else />
    </div>
    <!-- <DesignCanvas /> -->
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  position: relative;
}

.switch {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.right-side-bar {
  position: absolute;
  top: 25%;
  right: 0;
  z-index: 5;
}
</style>
