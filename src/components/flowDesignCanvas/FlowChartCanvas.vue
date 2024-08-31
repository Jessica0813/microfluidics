<template>
  <EditMenubar />
  <div style="width: 100%; height: 100%; position: relative">
    <div class="side-panel">
      <NodePanel />
    </div>
    <div class="top-bar">
      <ZoomSlider />
      <HistoryManager />
      <UploadDownLoadControls />
      <RightSideBar />
      <HotkeysManager />
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
      <Background
        :style="{ backgroundColor: showPatternedBackground ? '#faf9f7' : 'white' }"
        :pattern-color="showPatternedBackground ? 'black' : 'none'"
      />
      <template #node-process="processNodeProps">
        <ProcessNode v-bind="processNodeProps" />
      </template>
      <template #node-pause="pauseNodeProps">
        <PauseNode v-bind="pauseNodeProps" />
      </template>
      <template #node-condition="conditionNodeProps">
        <ConditionNode v-bind="conditionNodeProps" />
      </template>
      <template #node-schedule="scheduleNodeProps">
        <ScheduleNode v-bind="scheduleNodeProps" />
      </template>
      <template #edge-custom="props">
        <CustomEdge v-bind="props" />
      </template>
      <!-- <Controls /> -->
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { VueFlow, useVueFlow, type EdgeUpdateEvent } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import { type StateController, ActionType } from '@/types/stateController'
import { NodeType } from '@/types/node'

import { useStateStore } from '@/stores/useStateStore'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'

import NodePanel from './NodePanel.vue'
import ProcessNode from './ProcessNode.vue'
import ConditionNode from './ConditionNode.vue'
import PauseNode from './PauseNode.vue'
import CustomEdge from './CustomEdge.vue'
import ScheduleNode from './ScheduleNode.vue'
import UploadDownLoadControls from '../layout/UploadDownloadControls.vue'
import ZoomSlider from './ZoomSlider.vue'
import RightSideBar from '../layout/RightSideBar.vue'
import EditMenubar from './EditMenubar.vue'
import HistoryManager from './HistoryManager.vue'
import HotkeysManager from './HotkeysManager.vue'

const {
  getProcessNodeId,
  getPauseNodeId,
  getConditionNodeId,
  getProcessScheduleNodeId,
  getSubProcessId,
  getEdgeId
} = useNodeIdStore()
const {
  nodes,
  edges,
  findNode,
  onConnect,
  updateEdge,
  addEdges,
  addNodes,
  project,
  vueFlowRef,
  onNodesChange,
  onEdgesChange,
  getConnectedEdges,
  getOutgoers,
  getIncomers
} = useVueFlow()

const { addState } = useStateStore()

const { shouldRecordState } = storeToRefs(useStateStore())

const { showPatternedBackground } = storeToRefs(useFlowChartCanvasStore())

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
  const outGoers = getOutgoers(params.source)
  const inComers = getIncomers(params.source)
  if (
    outGoers.some((node) => node.id === params.target) ||
    inComers.some((node) => node.id === params.target)
  ) {
    return
  }
  // look through edges to check if any edge is connected to the source node
  if (!params.source.includes('condition_')) {
    addEdges([{ ...params, type: 'custom', id: getEdgeId() }])
  } else {
    let isTrueEdgeExist: boolean = false
    let isFalseEdgeExist: boolean = false
    edges.value.forEach((edge) => {
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
  if (
    connection.source === connection.target ||
    (connection.sourceHandle === edge.sourceHandle && connection.targetHandle === edge.targetHandle)
  ) {
    return
  }
  let newEdgeLable = ''
  if (connection.source !== connection.source) {
    if (connection.source.includes('condition_')) {
      const connectedEdges = getConnectedEdges(connection.source)
      const outEdges = connectedEdges.filter((edge) => edge.target !== connection.source)
      if (outEdges.length === 2) {
        return
      } else if (outEdges.length === 0) {
        newEdgeLable = 'Yes'
      } else if (outEdges.length === 1) {
        if (outEdges[0].label?.toString() === 'Yes') {
          newEdgeLable = 'No'
        } else {
          newEdgeLable = 'Yes'
        }
      }
    } else {
      if (edge.label === 'Yes' || edge.label === 'No') {
        newEdgeLable = ''
      }
    }
  } else {
    newEdgeLable = edge.label?.toString() || ''
  }

  const state: StateController = {
    type: ActionType.UPDATE_EDGE,
    name: 'update edge ' + edge.id,
    objectId: edge.id,
    oldState: {
      data: '',
      source: edge.source,
      target: edge.target,
      sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
      targetHandleId: edge.targetHandle ? edge.targetHandle : '',
      edgeLabel: edge.label?.toString() || ''
    },
    newState: {
      data: '',
      source: connection.source,
      target: connection.target,
      sourceHandleId: connection.sourceHandle ? connection.sourceHandle : '',
      targetHandleId: connection.targetHandle ? connection.targetHandle : '',
      edgeLabel: newEdgeLable
    }
  }
  const updatedEdge = updateEdge(edge, connection, false)
  if (updatedEdge) {
    updatedEdge.label = newEdgeLable
  }
  addState(state)
}

function onDrop(event: any) {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (type === '') return

  if (type === NodeType.Process) {
    for (const node of nodes.value) {
      if (node.type === NodeType.Schedule) {
        // check if the mouse is over a schedule node
        const nodePosition = node.position
        const nodeDimensions = node.dimensions
        if (
          event.clientX > nodePosition.x &&
          event.clientX < nodePosition.x + nodeDimensions.width &&
          event.clientY > nodePosition.y &&
          event.clientY < nodePosition.y + nodeDimensions.height
        ) {
          const flowControlSubprocesses = node.data.scheduledFlowControl.processes
          const oldData = JSON.parse(JSON.stringify(node.data.scheduledFlowControl))
          const subProcessId = getSubProcessId()
          flowControlSubprocesses.push({
            id: subProcessId,
            name: subProcessId,
            selected: false,
            startTime: 0.0,
            endTime: 1.0,
            duration: 1.0,
            inlet: 'inlet 1',
            injection: 'pump',
            fluid: null,
            pressure: 0,
            flowrate: 0
          })
          const newData = JSON.parse(JSON.stringify(node.data.scheduledFlowControl))
          const state: StateController = {
            type: ActionType.UPDATE_NODE_DATA,
            name: 'update node data ' + node.id,
            objectId: node.id,
            oldState: {
              objectPosition: node.position,
              data: oldData
            },
            newState: {
              objectPosition: node.position,
              data: newData,
              changedSubprocessId: subProcessId
            }
          }
          addState(state)
          return
        }
      }
    }
  }

  if (vueFlowRef.value === null) return
  const { left, top } = vueFlowRef.value.getBoundingClientRect()

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top
  })

  let nodeId: string = ''
  if (type === NodeType.Process) {
    nodeId = getProcessNodeId()
  } else if (type === NodeType.Pause) {
    nodeId = getPauseNodeId()
  } else if (type === NodeType.Condition) {
    nodeId = getConditionNodeId()
  } else if (type === NodeType.Schedule) {
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

  let nodeData = {}

  if (type === NodeType.Schedule) {
    nodeData = {
      totalDuration: 20,
      name: 'a',
      processes: []
    }
    newNode = { ...newNode, data: { scheduledFlowControl: nodeData } }
  } else if (type === NodeType.Pause) {
    nodeData = {
      duration: 0
    }
    newNode = { ...newNode, data: { pause: nodeData } }
  } else if (type === NodeType.Process) {
    nodeData = {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: null,
      pressure: 0,
      duration: 0,
      flowrate: 0,
      inletState: 'connect'
    }
    newNode = { ...newNode, data: { flowControl: nodeData, isOverScheduleNode: false } }
  } else if (type === NodeType.Condition) {
    nodeData = {
      name: 'xxx',
      sensor: null,
      operator: '=',
      color: '#FFFFFF',
      measurement: 0
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

          let stringifiedData: any

          if (type === NodeType.Schedule) {
            stringifiedData = JSON.parse(JSON.stringify(node.data.scheduledFlowControl))
          } else if (type === NodeType.Pause) {
            stringifiedData = Object.assign({}, node.data.pause)
          } else if (type === NodeType.Process) {
            stringifiedData = Object.assign({}, node.data.flowControl)
          } else if (type === NodeType.Condition) {
            stringifiedData = Object.assign({}, node.data.condition)
          }

          const state: StateController = {
            type: ActionType.CREATE_NODE,
            name: 'create node ' + newNode.id,
            objectId: newNode.id,
            oldState: {
              objectPosition: node.position,
              nodeType: newNode.type,
              data: stringifiedData
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
      if (node?.data.isOverScheduleNode) {
        return
      }
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
          targetHandleId: change.item.targetHandle ? change.item.targetHandle : '',
          edgeLabel: change.item.label?.toString() || ''
        }
      }
      addState(state)
    }
  })
})
</script>
