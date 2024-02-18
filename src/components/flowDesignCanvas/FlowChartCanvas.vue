<script setup lang="ts">
import { VueFlow, useVueFlow, type EdgeUpdateEvent } from '@vue-flow/core'
import { nextTick, watch } from 'vue'
import NodePanel from './NodePanel.vue'
import { Background } from '@vue-flow/background'
import ProcessNode from './ProcessNode.vue'
import ConditionNode from './ConditionNode.vue'
import { Controls } from '@vue-flow/controls'
import CustomEdge from './CustomEdge.vue'
import ScheduledProcessNode from './ScheduledProcessNode.vue'
import UploadDownLoadControls from '../layout/UploadDownloadControls.vue'
import ZoomSlider from './ZoomSlider.vue'

let processNodeId = 1
let conditionNodeId = 1
let processScheduleNodeId = 1

let edgeId = 0
function getProcessNodeId() {
  return `process_${processNodeId++}`
}

function getConditionNodeId() {
  return `condition_${conditionNodeId++}`
}

function getProcessScheduleNodeId() {
  return `schedule_${processScheduleNodeId++}`
}

function getEdgeId() {
  return `edge_${edgeId++}`
}

const { getEdges, findNode, onConnect, updateEdge, addEdges, addNodes, project, vueFlowRef } =
  useVueFlow()

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

onConnect((params) => {
  if (params.source === params.target) {
    return
  }
  // look through edges to check if any edge is connected to the source node
  if (params.source.includes('process_node') || params.source.includes('process_schedule_node')) {
    addEdges([{ ...params, type: 'custom', id: getEdgeId() }])
  } else if (params.source.includes('condition_node')) {
    let isTrueEdgeExist: boolean = false
    let isFalseEdgeExist: boolean = false
    getEdges.value.forEach((edge) => {
      if (edge.source === params.source) {
        if (edge.label === 'Yes') {
          isTrueEdgeExist = true
        } else if (edge.label === 'No') {
          isFalseEdgeExist = true
        }
      }
    })

    if (isTrueEdgeExist && isFalseEdgeExist) {
      return
    } else if ((!isTrueEdgeExist && !isFalseEdgeExist) || isFalseEdgeExist) {
      addEdges([{ ...params, type: 'custom', id: getEdgeId(), label: 'Yes' }])
    } else if (isTrueEdgeExist) {
      addEdges([{ ...params, type: 'custom', id: getEdgeId(), label: 'No' }])
    }
  }
})

function onEdgeUpdate({ edge, connection }: EdgeUpdateEvent) {
  return updateEdge(edge, connection, false)
}

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/vueflow')

  if (vueFlowRef.value === null) return
  const { left, top } = vueFlowRef.value.getBoundingClientRect()

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top
  })

  let nodeId: string = ''
  if (type === 'process') {
    nodeId = getProcessNodeId()
  } else if (type === 'condition') {
    nodeId = getConditionNodeId()
  } else if (type === 'schedule') {
    nodeId = getProcessScheduleNodeId()
  }

  let newNode = {
    id: nodeId,
    type,
    position,
    data: {}
  }

  if (type === 'schedule') {
    const nodeData = {
      totalDuration: 20,
      name: nodeId,
      processes: []
    }
    newNode = { ...newNode, data: { scheduledFlowControl: nodeData } }
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
  <div @drop="onDrop" style="width: 100%; height: 100%; position: relative">
    <div class="side-panel">
      <NodePanel />
    </div>
    <div class="top-bar">
      <ZoomSlider />
      <UploadDownLoadControls />
    </div>
    <VueFlow
      @dragover="onDragOver"
      :default-viewport="{ zoom: 1 }"
      :default-edge-options="{ markerEnd: 'arrow', updatable: true }"
      :zoom-on-double-click="false"
      :max-zoom="2"
      :min-zoom="0.2"
      @edge-update="onEdgeUpdate"
    >
      <Background style="background-color: #faf9f7" pattern-color="black" />
      <template #node-process="processNodeProps">
        <ProcessNode v-bind="processNodeProps" />
      </template>
      <template #node-condition="conditionNodeProps">
        <ConditionNode v-bind="conditionNodeProps" />
      </template>
      <template #node-schedule="scheduleNodeProps">
        <ScheduledProcessNode v-bind="scheduleNodeProps" />
      </template>
      <template #edge-custom="props">
        <CustomEdge v-bind="props" />
      </template>
      <Controls />
    </VueFlow>
  </div>
</template>
