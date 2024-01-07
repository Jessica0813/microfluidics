<script setup lang="ts">
function onDragStart(event: any, nodeType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="panel text-center flex-column elevation-1">
    <v-tooltip>
      <template v-slot:activator="{ props }">
        <div
          class="icon-padding"
          :draggable="true"
          @dragstart="onDragStart($event, 'process')"
          v-bind="props"
        >
          <v-icon size="small" color="grey-darken-3"> mdi-form-select </v-icon>
        </div>
      </template>
      <span>Process Node</span>
    </v-tooltip>
    <v-tooltip>
      <template v-slot:activator="{ props }">
        <div
          class="icon-padding"
          :draggable="true"
          @dragstart="onDragStart($event, 'condition')"
          v-bind="props"
        >
          <v-icon size="small" color="grey-darken-3" style="transform: rotate(180deg)">
            mdi-call-split</v-icon
          >
        </div>
      </template>
      <span>Condition Node</span>
    </v-tooltip>
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
