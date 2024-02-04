<script setup lang="ts">
import FlowChartCanvas from './components/flowDesignCanvas/FlowChartCanvas.vue'
import CanvasSwitch from './components/layout/CanvasSwitch.vue'
import RightSideBar from './components/layout/RightSideBar.vue'
import { ref } from 'vue'
// import { useVueFlow } from '@vue-flow/core'
import DesignCanvas from './components/sensorPlacementCanvas/DesignCanvas.vue'

// to keep the state of flow design canvas and sensor
// need to figure out how it achieved
// const { getNodes } = useVueFlow()

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
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  position: relative;
}

.switch {
  display: flex;
  flex-direction: row;
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
