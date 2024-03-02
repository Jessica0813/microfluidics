<script setup lang="ts">
import type { DesignCanvasControl } from '@/types/designCanvasControl'
import { defaultDesignCanvasControl } from '@/types/designCanvasControl'
import { inject } from 'vue'

const { designCanvasSize, toggleDesignCanvasSize } =
  inject<DesignCanvasControl>('DesignCanvasControl') || defaultDesignCanvasControl

function onDragStart(event: DragEvent, sensorType: string) {
  setTimeout(() => {
    if (designCanvasSize.value === 'small') {
      toggleDesignCanvasSize()
    }
  }, 300)
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
  padding: 4px 6px;
}
.icon-padding:hover {
  background-color: #e0e0e0;
}
</style>
