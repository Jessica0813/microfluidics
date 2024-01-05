<script setup lang="ts">
import FileUploadButton from './components/FileUploadButton.vue';
import FlowChartCanvas from './components/FlowChartCanvas.vue'
</script>

<template>
  <div id="app">
    <div class="flowchart-canvas">
    <FlowChartCanvas />
    </div>
    <div class="design">
      <FileUploadButton />
    </div>
  </div>
</template>


<style scoped>
.flowchart-canvas {
  width: 60%;
  border-right: 1px solid #BDBDBD;
}
.design {
  width: 40%;
}
</style>
