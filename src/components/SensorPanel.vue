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
      title="Pressure Sensor"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, 'temperature')"
    >
      <v-icon size="small" color="grey-darken-3"> mdi-rectangle-outline </v-icon>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px;
}
.icon-padding {
  padding: 4px 6px;
}
.icon-padding:hover {
  background-color: #e0e0e0;
}
</style>
