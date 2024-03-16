<script setup lang="ts">
function onDragStart(event: DragEvent, sensorType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/desgin', sensorType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="panel text-center flex-column elevation-1">
    <div
      title="temperature Sensor"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, 'temperature')"
    >
      <v-icon size="small" color="#515a6e"> mdi-circle-outline </v-icon>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 2px;
}
.icon-padding {
  padding: 0px 2px;
}
.icon-padding:hover {
  background-color: #e0e0e0;
}
</style>
