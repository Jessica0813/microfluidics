<template>
  <div class="vertical-button-group ml-2">
    <TableConfigureButton title="fluid table" />
    <button class="icon-button with-right-border" title="DRC" @click="checkNodeDataValidity">
      <v-icon size="small" color="#66615b">mdi-text-box-check-outline</v-icon>
    </button>
    <button
      class="icon-button"
      title="run"
      @click="
        async () => {
          await runSimulation()
        }
      "
    >
      <v-icon size="small" color="#66615b">mdi-play</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow, type GraphNode } from '@vue-flow/core'
import { NodeType } from '@/types/node'
import { SensorType } from '@/types/sensor'
import TableConfigureButton from './TableConfigureButton.vue'

const {
  findNode,
  getIncomers,
  nodes,
  getOutgoers,
  getConnectedEdges,
  removeSelectedElements,
  getSelectedElements
} = useVueFlow()

function checkNodeDataValidity() {
  removeSelectedElements(getSelectedElements.value)
  for (const node of nodes.value) {
    switch (node.type) {
      case NodeType.Process:
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
      case NodeType.Condition:
        if (node.data.condition) {
          const condition = node.data.condition
          if (
            !condition.sensor ||
            (condition.sensor.type === SensorType.Speed && condition.measurement <= 0)
          ) {
            node.selected = true
          }
        } else {
          node.selected = true
        }
        break
      case NodeType.Pause:
        if (node.data.pause.duration <= 0) {
          node.selected = true
        }
        break
      case NodeType.Schedule:
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

async function findNextNode(node: GraphNode): Promise<void> {
  if (node.type === NodeType.Condition) {
    const edges = getConnectedEdges([node])
    const outEdges = edges.filter((edge) => edge.target !== node.id)
    if (outEdges.length === 0) {
      return
    }
    const promises = outEdges.map(async (edge) => {
      const nextNode = findNode(edge.target)
      if (nextNode) {
        await implementation(nextNode)
      }
    })
    await Promise.all(promises)
  } else {
    const outgoers = getOutgoers(node)
    if (outgoers.length === 0) {
      return
    }
    const promises = outgoers.map(async (outgoer) => {
      await implementation(outgoer)
    })
    await Promise.all(promises)
  }
}

async function implementation(node: GraphNode): Promise<void> {
  if (node.type === NodeType.Process) {
    node.selected = true
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        node.selected = false
        await findNextNode(node)
        resolve()
      }, node.data.flowControl.duration * 1000)
    })
  } else if (node.type === NodeType.Condition) {
    node.selected = true
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        node.selected = false
        await findNextNode(node)
        resolve()
      }, 0)
    })
    node.selected = false
  } else if (node.type === NodeType.Pause) {
    node.selected = true
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        node.selected = false
        await findNextNode(node)
        resolve()
      }, node.data.pause.duration * 1000)
    })
  } else if (node.type === NodeType.Schedule) {
    node.selected = true
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        node.selected = false
        await findNextNode(node)
        resolve()
      }, node.data.scheduledFlowControl.totalDuration * 1000)
    })
  }
}

async function runSimulation() {
  let startNodes: GraphNode[] = []
  for (const node of nodes.value) {
    const incomers = getIncomers(node)
    if (incomers.length === 0) {
      startNodes.push(node)
    }
  }
  if (startNodes.length === 0) {
    return
  }

  // Start from all the start nodes concurrently
  const promises = startNodes.map(async (startNode) => {
    await implementation(startNode)
  })

  await Promise.all(promises)
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
