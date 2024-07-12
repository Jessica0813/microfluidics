<template>
  <div class="menu">
    <label for="uploadSvg" class="button">
      <p>upload svg</p>
      <input type="file" id="uploadSvg" accept=".svg" style="display: none" />
    </label>
    <label for="uploadJson" class="button">
      <p>upload json</p>
      <input
        type="file"
        id="uploadJson"
        accept=".json"
        style="display: none"
        @change="handleJsonUpload"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import { useStateStore } from '@/stores/useStateStore'
import { useFluidStore } from '@/stores/useFluidStore'
import { useSensorStore } from '@/stores/useSensorStore'

const { addNodes, addEdges, nodes, edges, removeEdges, removeNodes } = useVueFlow()
const { initIndexes } = useNodeIdStore()
const { toggleShouldRecordState } = useStateStore()
const { initFluidIndex, addFluid, resetFluids, getFluidById } = useFluidStore()
const { findSensor } = useSensorStore()

function handleJsonUpload(e: Event) {
  toggleShouldRecordState()
  //reset everything
  const edgesId = edges.value.map((edge) => edge.id)
  const nodesId = nodes.value.map((node) => node.id)
  removeEdges(edgesId)
  removeNodes(nodesId)
  resetFluids()

  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    toggleShouldRecordState()
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result
      if (typeof result !== 'string') return

      const data = JSON.parse(result)

      for (const fluid of data.fluids) {
        addFluid(fluid)
      }
      initFluidIndex(data.fluidIndex)

      addNodes([...data.nodes])

      for (const node of data.nodes) {
        if (node.type === 'process' && node.data.flowControl.fluid !== null) {
          const fluid = getFluidById(node.data.flowControl.fluid.id)
          if (fluid) {
            node.data.flowControl.fluid = fluid
          }
        } else if (node.type === 'condition' && node.data.condition.sensor !== null) {
          const sensor = findSensor(node.data.condition.sensor.id)
          if (sensor) {
            node.data.condition.sensor = sensor
          } else {
            node.data.condition.sensor = null
          }
        } else if (
          node.type === 'schedule' &&
          node.data.scheduledFlowControl.processes.length > 0
        ) {
          for (const process of node.data.scheduledFlowControl.processes) {
            if (process.fluid !== null) {
              const fluid = getFluidById(process.fluid.id)
              if (fluid) {
                process.fluid = fluid
              }
            }
          }
        }
      }

      setTimeout(() => {
        addEdges([...data.edges])
      }, 800)

      initIndexes(data.indexes)
    } catch (error) {
      console.error('An error occurred while processing the file:', error)
    } finally {
      setTimeout(() => {
        toggleShouldRecordState()
      }, 800)
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 0.5px solid lightgray;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px;
}
.button {
  text-align: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 2px;
}
.button:hover {
  background-color: #eeeeee;
}
</style>
