<script setup lang="ts">
function onDragStart(event: any, nodeType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="panel text-center flex-column">
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <div
          class="pa-1"
          :draggable="true"
          @dragstart="onDragStart($event, 'custom')"
          v-bind="props"
          :style="{ backgroundColor: isHovering ? '#EEEEEE' : '', borderBottom: '1px solid #eee' }"
        >
          <v-icon size="20" color="grey-darken-3"> mdi-cog</v-icon>
        </div>
      </template>
    </v-hover>
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <div
          class="pa-1"
          :draggable="true"
          @dragstart="onDragStart($event, 'condition')"
          v-bind="props"
          :style="{ backgroundColor: isHovering ? '#EEEEEE' : '' }"
        >
          <v-icon size="20" color="grey-darken-3" style="transform: rotate(180deg)">
            mdi-call-split</v-icon
          >
        </div>
      </template>
    </v-hover>
  </div>
</template>

<style scoped>
.panel {
  background-color: #fefefe;
  border: 1px solid #eee;
  box-sizing: 0 0 2px 1px #00000014;
  margin: 15px;
}
</style>
