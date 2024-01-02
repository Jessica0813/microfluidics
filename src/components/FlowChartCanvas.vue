<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { nextTick, watch } from 'vue'
import SidePanel from './SidePanel.vue'
import { Background } from '@vue-flow/background'
import ActionNode from './ActionNode.vue'
import ConditionNode from './ConditionNode.vue'
import { Controls } from '@vue-flow/controls'

let id = 0
function getId() {
  return `node_${id++}`
}

const { findNode, onConnect, addEdges, addNodes, project, vueFlowRef } = useVueFlow()

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

onConnect((params) => addEdges(params))

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
    position,
    label: `${type} node`
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
        <ActionNode v-bind="customNodeProps" />
      </template>
      <template #node-condition="conditionNodeProps">
        <ConditionNode v-bind="conditionNodeProps" />
      </template>
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.side-panel {
  position: absolute;
  top: 0; /* Adjust the top position as needed */
  left: 0;
  z-index: 5;
  cursor: pointer;
}

.vue-flow__controls {
  display: flex;
}
</style>
