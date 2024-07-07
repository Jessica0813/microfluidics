<template>
  <div class="vertical-button-group ml-2">
    <TableConfigureButton title="fluid table" />
    <button class="icon-button with-right-border" title="DRC" @click="checkNodeDataValidity">
      <v-icon size="small" color="#66615b">mdi-text-box-check-outline</v-icon>
    </button>
    <button class="icon-button" title="run" @click="runSimulation">
      <v-icon size="small" color="#66615b">mdi-play</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow, type Node } from '@vue-flow/core'
import { SensorType } from '@/types/sensor'
import TableConfigureButton from './TableConfigureButton.vue'

const { getIncomers, nodes, getOutgoers } = useVueFlow()

function checkNodeDataValidity() {
  for (const node of nodes.value) {
    switch (node.type) {
      case 'process':
        if (node.data.flowControl) {
          const flowControl = node.data.flowControl
          if (
            !flowControl.inlet ||
            !flowControl.fluid ||
            (flowControl.injection === 'pump' && flowControl.pressure <= 0) ||
            (flowControl.injection === 'needle' && flowControl.flowrate <= 0) ||
            flowControl.duration <= 0
          ) {
            node.selected = true
          }
        } else {
          node.selected = true
        }
        break
      case 'condition':
        if (node.data.condition) {
          const condition = node.data.condition
          if (
            !condition.sensor ||
            (condition.sensor.type === SensorType.Viscosity && condition.measurement <= 0)
          ) {
            node.selected = true
          }
        } else {
          node.selected = true
        }
        break
      case 'pause':
        if (node.data.pause.duration <= 0) {
          node.selected = true
        }
        break
      case 'schedule':
        if (
          !node.data.scheduledFlowControl &&
          node.data.scheduledFlowControl.totalDuration > 0 &&
          node.data.scheduledFlowControl.processes.length > 0
        ) {
          const scheduledFlowControl = node.data.scheduledFlowControl.processes
          for (const flowControl of scheduledFlowControl) {
            if (
              !flowControl.inlet ||
              !flowControl.fluid ||
              (flowControl.injection === 'pump' && flowControl.pressure <= 0) ||
              (flowControl.injection === 'needle' && flowControl.flowrate <= 0) ||
              flowControl.duration <= 0
            ) {
              node.selected = true
              break
            }
          }
        } else {
          node.selected = true
        }
        break
    }
  }
}

function runSimulation() {
  let startNodes: Node[] = []
  for (const node of nodes.value) {
    const incomers = getIncomers(node)
    if (incomers.length === 0) {
      startNodes.push(node)
    }
  }
  if (startNodes.length === 0) {
    console.warn('No start node found')
    return
  }

  //start from all the start nodes at the same time
}
</script>

<style scoped>
.vertical-button-group {
  display: flex;
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
