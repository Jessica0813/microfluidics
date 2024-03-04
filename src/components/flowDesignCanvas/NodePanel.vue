<script setup lang="ts">
import { onMounted } from 'vue'
import tippy from 'tippy.js'

function onDragStart(event: DragEvent, nodeType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'

    const draggingElement = document.getElementById('process_node_tooltip')
    if (draggingElement) {
      const left = draggingElement.getBoundingClientRect().width / 2
      const top = draggingElement.getBoundingClientRect().height / 2
      event.dataTransfer.setDragImage(draggingElement, left, top)
    }
  }
}

onMounted(() => {
  // Initialize Tippy on the #process_node element
  tippy('#process_node', {
    content: `
        <div class="flex align-center justify-center pa-3" id="process_node_tooltip"
             style="width: 300px; height: auto; background-color: #eeeeee; border-radius: 4px">
          <p style="font-size: 14px">
            <strong>water</strong> is injected into
            <strong>inlet 1</strong> using
            <strong>pump</strong> at a pressure of
            <strong>0</strong> for a duration of
            <strong>0</strong> seconds
          </p>
        </div>`,
    placement: 'right',
    allowHTML: true,
    theme: 'light',
    arrow: true,
    trigger: 'mouseenter',
    duration: 200,
    offset: [5, 5]
  })
})
</script>

<template>
  <div class="panel text-center flex-column elevation-1">
    <div
      id="process_node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, 'process')"
    >
      <v-icon size="small" color="#515a6e"> mdi-form-select </v-icon>
    </div>
    <div
      title="Condition Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, 'condition')"
    >
      <v-icon size="small" color="#515a6e" style="transform: rotate(180deg)">
        mdi-call-split</v-icon
      >
    </div>
    <div
      title="Schedule Node"
      class="icon-padding"
      :draggable="true"
      @dragstart="onDragStart($event, 'schedule')"
    >
      <v-icon size="small" color="#515a6e"> mdi-chart-gantt</v-icon>
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
