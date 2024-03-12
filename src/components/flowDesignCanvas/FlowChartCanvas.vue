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
import { useMenuPositionCalculator } from '@/composables/useMenuPositionCalculator'
import ProcessEditMenubar from './ProcessEditMenubar.vue'
import ConditionEditMenuBar from './ConditionEditMenuBar.vue'
import ScheduledProcessEditMenuBar from './ScheduledProcessEditMenuBar.vue'
import { ref } from 'vue'

let processNodeId = 1
let conditionNodeId = 1
let processScheduleNodeId = 1

let edgeId = 1
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

const {
  getEdges,
  findNode,
  onConnect,
  updateEdge,
  addEdges,
  addNodes,
  project,
  vueFlowRef,
  onNodeDragStart,
  onNodeDragStop,
  getSelectedNodes,
  onViewportChangeStart,
  onViewportChangeEnd,
  viewport
} = useVueFlow()

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
      name: 'a',
      processes: []
    }
    newNode = { ...newNode, data: { scheduledFlowControl: nodeData } }
  } else if (type === 'process') {
    const nodeData = {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: 'water',
      pressure: 0,
      duration: 0,
      flowrate: 0
    }
    newNode = { ...newNode, data: { flowControl: nodeData } }
  } else if (type === 'condition') {
    const nodeData = {
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
        }
      },
      { deep: true, flush: 'post' }
    )
  })
}

function isNodeinView(nodeX: number, nodeY: number, width: number, height: number) {
  const { x, y, zoom } = viewport.value
  const screenX = (nodeX + x) * zoom
  const screenY = (nodeY + y) * zoom

  if (vueFlowRef.value === null) return
  const { left, top, right, bottom } = vueFlowRef.value.getBoundingClientRect()
  return screenX > left - width && screenY > top - height && screenX < right && screenY < bottom
}

const floatingRef = ref<HTMLElement | null>(null)
const isMenuBarOpen = ref(false)
const selectedId = ref<string | null>(null)

watch(
  getSelectedNodes,
  (newSelectedNodes, oldSelectedNodes) => {
    if (newSelectedNodes.length === 1) {
      if (selectedId.value === null) {
        selectedId.value = newSelectedNodes[0].id
        isMenuBarOpen.value = true
      } else if (newSelectedNodes[0] !== oldSelectedNodes[0]) {
        selectedId.value = newSelectedNodes[0].id
      }
      const element = document.getElementById(selectedId.value!)
      useMenuPositionCalculator(element, floatingRef.value)
    } else {
      isMenuBarOpen.value = false
      selectedId.value = null
    }
  },
  {
    deep: true
  }
)

onNodeDragStart(() => {
  isMenuBarOpen.value = false
})

onNodeDragStop(() => {
  const node = findNode(selectedId.value!)

  if (!node) {
    return
  }

  if (
    !isNodeinView(node.position.x, node.position.y, node.dimensions.width, node.dimensions.height)
  ) {
    return
  }

  isMenuBarOpen.value = true
  const element = document.getElementById(selectedId.value!)
  useMenuPositionCalculator(element, floatingRef.value)
})

onViewportChangeStart(() => {
  if (selectedId.value) {
    isMenuBarOpen.value = false
  }
})

onViewportChangeEnd(() => {
  const node = findNode(selectedId.value!)

  if (!node) {
    return
  }

  if (
    !isNodeinView(node.position.x, node.position.y, node.dimensions.width, node.dimensions.height)
  ) {
    return
  }

  if (selectedId.value) {
    isMenuBarOpen.value = true
    const element = document.getElementById(selectedId.value)
    useMenuPositionCalculator(element, floatingRef.value)
  }
})
</script>

<template>
  <div ref="floatingRef" style="position: absolute; z-index: 1000" v-show="isMenuBarOpen">
    <ProcessEditMenubar v-if="findNode(selectedId)?.type === 'process'" :id="selectedId" />
    <ConditionEditMenuBar v-else-if="findNode(selectedId)?.type === 'condition'" :id="selectedId" />
    <ScheduledProcessEditMenuBar
      v-else-if="findNode(selectedId)?.type === 'schedule'"
      :id="selectedId"
    />
  </div>
  <div @drop="onDrop" style="width: 100%; height: 100%; position: relative">
    <div class="side-panel">
      <NodePanel />
    </div>
    <div class="top-bar">
      <ZoomSlider />
      <UploadDownLoadControls />
      <RightSideBar />
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
      <!-- <Controls /> -->
    </VueFlow>
  </div>
</template>
