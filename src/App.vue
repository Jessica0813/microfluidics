<script setup lang="ts">
import FlowChartCanvas from './components/FlowChartCanvas.vue'
import DesignCanvas from './components/DesignCanvas.vue';
</script>

<template>
  <div id="app">
    <div class="flowchart-canvas">
      <!-- <FlowChartCanvas /> -->
      <DesignCanvas />
    </div>
  </div>
</template>

<style scoped>
.flowchart-canvas {
  width: 100%;
  border-right: 1px solid #bdbdbd;
}
</style>
