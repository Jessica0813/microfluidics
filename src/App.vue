<script setup lang="ts">
import FlowChartCanvas from './components/flowDesignCanvas/FlowChartCanvas.vue'
import RightSideBar from './components/layout/RightSideBar.vue'
import DesignCanvas from './components/sensorPlacementCanvas/DesignCanvas.vue'
</script>

<template>
  <div id="app">
    <div class="canvas">
      <FlowChartCanvas />
      <div class="right-side-bar">
        <RightSideBar />
      </div>
      <div class="design-canvas elevation-1">
        <DesignCanvas />
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  width: 100%;
  position: relative;
}

.right-side-bar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.design-canvas {
  width: 40%;
  height: 50%;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 5;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
}
</style>
