<template>
  <div class="panel text-center flex-column elevation-1">
    <div
      title="Process Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, NodeType.Process)"
    >
      <v-icon size="small" color="#515a6e"> mdi-form-select </v-icon>
    </div>
    <div
      title="Pause Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, NodeType.Pause)"
    >
      <v-icon size="small" color="#515a6e"> mdi-pause </v-icon>
    </div>
    <div
      title="Condition Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, NodeType.Condition)"
    >
      <v-icon size="small" color="#515a6e" style="transform: rotate(180deg)">
        mdi-call-split</v-icon
      >
    </div>
    <div
      title="Schedule Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, NodeType.Schedule)"
    >
      <v-icon size="small" color="#515a6e"> mdi-chart-gantt</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NodeType } from '@/types/node'
function onDragStart(event: DragEvent, nodeType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

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
