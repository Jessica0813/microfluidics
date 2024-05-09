<template>
  <EditMenubar />
  <div style="width: 100%; height: 100%; position: relative">
    <div class="side-panel">
      <NodePanel />
    </div>
    <div class="top-bar">
      <ZoomSlider />
      <HistoryManager v-model:should-record-state="shouldRecordState" />
      <UploadDownLoadControls />
      <RightSideBar />
    </div>
    <VueFlow
      @dragover="onDragOver"
      @drop="onDrop"
      :default-viewport="{ zoom: 1 }"
      :default-edge-options="{ markerEnd: 'arrow', updatable: true }"
      :zoom-on-double-click="false"
      :max-zoom="2"
      :min-zoom="0.2"
      @edge-update="onEdgeUpdate"
      :delete-key-code="null"
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
      <!-- <Controls /> -->
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, useVueFlow, type EdgeUpdateEvent } from '@vue-flow/core'
import { nextTick, watch } from 'vue'
import NodePanel from './NodePanel.vue'
import { Background } from '@vue-flow/background'
import ProcessNode from './ProcessNode.vue'
import ConditionNode from './ConditionNode.vue'
// import { Controls } from '@vue-flow/controls'
import CustomEdge from './CustomEdge.vue'
import ScheduledProcessNode from './ScheduledProcessNode.vue'
import UploadDownLoadControls from '../layout/UploadDownloadControls.vue'
import ZoomSlider from './ZoomSlider.vue'
import RightSideBar from '../layout/RightSideBar.vue'
import EditMenubar from './EditMenubar.vue'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { ref } from 'vue'
import HistoryManager from './HistoryManager.vue'
import hotkeys from 'hotkeys-js'
import {
  createDeleteNodeState,
  createDeleteEdgeState,
  createDeleteMultiEdgesState,
  createDeleteMultiNodesState
} from '@/composables/useStateCreation'

let processNodeId = 1
let conditionNodeId = 1
let processScheduleNodeId = 1

let edgeId = 1
let edgeTrueId = 1
let edgeFalseId = 1

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

function getEdgeTrueId() {
  return `edgeTrue_${edgeTrueId++}`
}

function getEdgeFalseId() {
  return `edgeFalse_${edgeFalseId++}`
}

const {
  getEdges,
  findNode,
  onConnect,
  updateEdge,
  addEdges,
  addNodes,
  project,
  vueFlowRef,
  onNodesChange,
  onEdgesChange,
  getSelectedEdges,
  getSelectedNodes,
  removeNodes,
  removeEdges,
  getConnectedEdges
} = useVueFlow()

const shouldRecordState = ref(true)

const { addState } = useStateStore()

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
  if (params.source.includes('process_') || params.source.includes('schedule_')) {
    addEdges([{ ...params, type: 'custom', id: getEdgeId() }])
  } else if (params.source.includes('condition_')) {
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
      addEdges([{ ...params, type: 'custom', id: getEdgeTrueId(), label: 'Yes' }])
    } else if (isTrueEdgeExist) {
      addEdges([{ ...params, type: 'custom', id: getEdgeFalseId(), label: 'No' }])
    }
  }
})

function onEdgeUpdate({ edge, connection }: EdgeUpdateEvent) {
  const state: StateController = {
    type: ActionType.UPDATE_EDGE,
    name: 'update edge ' + edge.id,
    objectId: edge.id,
    oldState: {
      data: '',
      source: edge.source,
      target: edge.target,
      sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
      targetHandleId: edge.targetHandle ? edge.targetHandle : ''
    },
    newState: {
      data: '',
      source: connection.source,
      target: connection.target,
      sourceHandleId: connection.sourceHandle ? connection.sourceHandle : '',
      targetHandleId: connection.targetHandle ? connection.targetHandle : ''
    }
  }
  addState(state)
  updateEdge(edge, connection, false)
}

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (type === '') return

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
  } else {
    return
  }

  let newNode = {
    id: nodeId,
    type,
    position,
    data: {}
  }

  let nodeData

  if (type === 'schedule') {
    nodeData = {
      totalDuration: 20,
      name: 'a',
      processes: []
    }
    newNode = { ...newNode, data: { scheduledFlowControl: nodeData } }
  } else if (type === 'process') {
    nodeData = {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: 'water',
      pressure: 0,
      duration: 0,
      flowrate: 0
    }
    newNode = { ...newNode, data: { flowControl: nodeData } }
  } else if (type === 'condition') {
    nodeData = {
      name: 'xxx',
      sensor: 'color sensor',
      operator: '=',
      color: '#FFFFFF',
      viscosity: 0
    }
    newNode = { ...newNode, data: { condition: nodeData } }
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

          const state: StateController = {
            type: ActionType.CREATE_NODE,
            name: 'create node ' + newNode.id,
            objectId: newNode.id,
            oldState: {
              objectPosition: node.position,
              objectType: newNode.type,
              data: node.data.flowControl || node.data.condition || node.data.scheduledFlowControl
            }
          }

          addState(state)
        }
      },
      { deep: true, flush: 'post' }
    )
  })
}

onNodesChange((nodesChange) => {
  if (!shouldRecordState.value) {
    return
  }
  if (nodesChange.length === 1) {
    const change = nodesChange[0]
    if (change.type === 'position' && change.dragging === false) {
      const node = findNode(change.id)
      const state: StateController = {
        type: ActionType.MOVE_NODE,
        name: 'move node ' + change.id,
        objectId: change.id,
        oldState: {
          objectPosition: { x: change.from.x, y: change.from.y },
          data: ''
        },
        newState: {
          objectPosition: { x: node?.position.x || 0, y: node?.position.y || 0 },
          data: ''
        }
      }
      addState(state)
    }
  } else if (nodesChange.length > 1) {
    let state: StateController = {
      type: ActionType.MOVE_MULTI_NODES,
      name: 'move multiple nodes',
      objectId: [],
      oldState: [],
      newState: []
    }
    nodesChange.forEach((change) => {
      if (change.type === 'position' && change.dragging === false) {
        const node = findNode(change.id)
        if (
          Array.isArray(state.objectId) &&
          Array.isArray(state.oldState) &&
          Array.isArray(state.newState)
        ) {
          state.objectId.push(change.id)
          state.oldState.push({
            objectPosition: { x: change.from.x, y: change.from.y },
            data: ''
          })
          state.newState.push({
            objectPosition: { x: node?.position.x || 0, y: node?.position.y || 0 },
            data: ''
          })
        }
      }
    })
    if (state.objectId.length > 0) {
      addState(state)
    }
  }
})

onEdgesChange((edgesChange) => {
  if (!shouldRecordState.value) {
    return
  }
  edgesChange.forEach((change) => {
    if (change.type === 'add') {
      const state: StateController = {
        type: ActionType.CREATE_EDGE,
        name: 'create edge ' + change.item.id,
        objectId: change.item.id,
        oldState: {
          data: '',
          source: change.item.source,
          target: change.item.target,
          sourceHandleId: change.item.sourceHandle ? change.item.sourceHandle : '',
          targetHandleId: change.item.targetHandle ? change.item.targetHandle : ''
        }
      }
      addState(state)
    }
  })
})

hotkeys('backspace,del,delete', function (event) {
  event.preventDefault()
  if (getSelectedNodes.value.length === 1 && getSelectedEdges.value.length === 0) {
    let connectedEdges = getConnectedEdges(getSelectedNodes.value)
    const state = createDeleteNodeState(
      getSelectedNodes.value,
      connectedEdges,
      removeNodes,
      removeEdges
    )
    if (state) {
      addState(state)
    }
  } else if (getSelectedNodes.value.length === 0 && getSelectedEdges.value.length === 1) {
    const state = createDeleteEdgeState(getSelectedEdges.value, removeEdges)
    if (state) {
      addState(state)
    }
  } else if (getSelectedNodes.value.length === 0 && getSelectedEdges.value.length > 1) {
    const state = createDeleteMultiEdgesState(getSelectedEdges.value, removeEdges)
    if (state) {
      addState(state)
    }
  } else if (getSelectedNodes.value.length >= 1) {
    const state = createDeleteMultiNodesState(
      getSelectedNodes.value,
      getSelectedEdges.value,
      removeNodes,
      removeEdges,
      getConnectedEdges
    )
    if (state) {
      addState(state)
    }
  }
})
</script>
