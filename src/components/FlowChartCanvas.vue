<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { nextTick, watch } from 'vue'
import SidePanel from './SidePanel.vue'
import { Background } from '@vue-flow/background'
import ActionNode from './ActionNode.vue'
import ConditionNode from './ConditionNode.vue'
import { Controls } from '@vue-flow/controls'
import CustomEdge from './CustomEdge.vue'

let nodeId = 0
let edgeId = 0
function getId() {
  return `node_${nodeId++}`
}

function getEdgeId() {
  return `edge_${edgeId++}`
}

const { findNode, onConnect, addEdges, addNodes, project, vueFlowRef } = useVueFlow()

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

onConnect((params) =>
  addEdges([{ ...params, type: 'custom', markerEnd: 'arrow', id: getEdgeId() }])
)

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/vueflow')

  if (vueFlowRef.value === null) return
  const { left, top } = vueFlowRef.value.getBoundingClientRect()

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top
  })

  const newNode = {
    id: getId(),
    type,
    position
  }

  addNodes([newNode])

  // align node position after drop, so it's centered to the mouse
  nextTick(() => {
    const node = findNode(newNode.id)
    if (node === undefined) return
    const stop = watch(
      () => node.dimensions,
      (dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          node.position = {
            x: node.position.x - node.dimensions.width / 2,
            y: node.position.y - node.dimensions.height / 2
          }
          stop()
        }
      },
      { deep: true, flush: 'post' }
    )
  })
}
</script>

<template>
  <div @drop="onDrop" style="width: 100%; height: 100vh">
    <div class="side-panel">
      <SidePanel />
    </div>
    <VueFlow @dragover="onDragOver" fit-view-on-init>
      <Background patternColor="grey-darken-3" />
      <template #node-custom="customNodeProps">
        <ActionNode v-bind="customNodeProps" :nodeId="customNodeProps.id" />
      </template>
      <template #node-condition="conditionNodeProps">
        <ConditionNode v-bind="conditionNodeProps" />
      </template>
      <template #edge-custom="props">
        <CustomEdge v-bind="props" />
      </template>
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.side-panel {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  cursor: pointer;
}

.vue-flow__controls {
  display: flex;
}
</style>
