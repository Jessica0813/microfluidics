<template>
  <div ref="floatingRef" class="wrapper fade-appearance" v-show="isEditMenuOpen" id="menu-bar">
    <div
      class="drag-button"
      @mouseenter="isDraggable = true"
      @mouseleave="isDraggable = false"
      v-tippy="{ content: 'Drag' }"
    >
      <v-icon size="small" color="#66615b">mdi-drag</v-icon>
    </div>
    <ProcessEditMenu
      v-if="findNode(selectedId)?.type === NodeType.Process"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <PauseEditMenu
      v-else-if="findNode(selectedId)?.type === NodeType.Pause"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <ConditionEditMenu
      v-else-if="findNode(selectedId)?.type === NodeType.Condition"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <ScheduleEditMenu
      v-else-if="findNode(selectedId)?.type === NodeType.Schedule"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
      v-model:edited-flow-control="flowControl"
    />
    <EdgeEditMenu v-else-if="findEdge(selectedId)?.type === 'custom'" :id="selectedId" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useVueFlow, type GraphNode } from '@vue-flow/core'
import type { NodeDragEvent } from '@vue-flow/core'
import { select } from 'd3'
import { drag, type D3DragEvent } from 'd3-drag'

import { type StateController, ActionType } from '@/types/stateController'
import { NodeType } from '@/types/node'

import {
  useMenuPositionCalculator,
  useMenuPositionCalculatorForEdges
} from '@/composables/useMenuPositionCalculator'
import { useElementInView } from '@/composables/useElementInView'

import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import { useStateStore } from '@/stores/useStateStore'

import ProcessEditMenu from './ProcessEditMenu.vue'
import PauseEditMenu from './PauseEditMenu.vue'
import ConditionEditMenu from './ConditionEditMenu.vue'
import ScheduleEditMenu from './ScheduleEditMenu.vue'
import EdgeEditMenu from './EdgeEditMenu.vue'

const flowControl = ref({
  id: '-1',
  name: 'xyz',
  selected: false,
  startTime: 0,
  endTime: 1,
  duration: 1,
  inlet: 'inlet 1',
  injection: 'pump',
  fluid: null,
  pressure: 0,
  flowrate: 0,
  inletState: 'connect'
})
const floatingRef = ref<HTMLDivElement | null>(null)
const isEditMenuOpen = ref(false)
const selectedId = ref<string | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDraggable = ref(false)
const isNodeOverScheduleNode = ref(false)
const intersectionScheduleNode = ref<GraphNode | null>(null)
let nodePositionbeforeDrag = { x: 0, y: 0 }

const { getSubProcessId } = useNodeIdStore()
const { addState } = useStateStore()
const {
  nodes,
  findNode,
  findEdge,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  getSelectedElements,
  onViewportChangeStart,
  onViewportChangeEnd,
  vueFlowRef,
  removeNodes,
  onEdgeUpdateStart,
  removeSelectedEdges
} = useVueFlow()
const { isFlowChartCanvasZooming } = storeToRefs(useFlowChartCanvasStore())

function openNodeMenuBar(element: HTMLElement | null) {
  if (!element) {
    return
  }
  isEditMenuOpen.value = true
  useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
    position.value = pos
  })
}

function openEdgeMenuBar(element: HTMLElement | null) {
  if (!element) {
    return
  }
  isEditMenuOpen.value = true
  useMenuPositionCalculatorForEdges(element, floatingRef.value).then((pos) => {
    position.value = pos
  })
}

function showMenuBar() {
  const element = document.getElementById(selectedId.value!)

  if (!element) {
    console.log('element not found')
    return
  }

  if (!useElementInView(vueFlowRef.value, element)) {
    return
  }

  if (selectedId.value?.includes('edge')) {
    openEdgeMenuBar(element)
  } else {
    openNodeMenuBar(element)
  }
}

function checkIfNodeIsOverScheduleNode(dragEvent: NodeDragEvent) {
  if (dragEvent.nodes.length > 1 || dragEvent.nodes.length === 0) {
    return
  }

  for (const node of nodes.value) {
    if (node.type === NodeType.Schedule) {
      const scheduleNode = document.getElementById(node.id)
      const { left, top, right, bottom } = scheduleNode!.getBoundingClientRect()
      const mousePosition = { x: dragEvent.event.x, y: dragEvent.event.y }
      if (
        mousePosition.x > left &&
        mousePosition.x < right &&
        mousePosition.y > top &&
        mousePosition.y < bottom
      ) {
        isNodeOverScheduleNode.value = true
        dragEvent.node.data.isOverScheduleNode = true
        intersectionScheduleNode.value = node
        return
      } else {
        isNodeOverScheduleNode.value = false
        dragEvent.node.data.isOverScheduleNode = false
        intersectionScheduleNode.value = null
      }
    } else {
      isNodeOverScheduleNode.value = false
      dragEvent.node.data.isOverScheduleNode = false
      intersectionScheduleNode.value = null
    }
  }

  isNodeOverScheduleNode.value = false
  dragEvent.node.data.isOverScheduleNode = false
  intersectionScheduleNode.value = null
}

watch(getSelectedElements, (newSelectedElements) => {
  if (newSelectedElements.length === 1) {
    selectedId.value = newSelectedElements[0].id

    let element = document.getElementById(selectedId.value!)

    if (selectedId.value.includes('edge')) {
      if (!element) {
        setTimeout(() => {
          element = document.getElementById(selectedId.value!)
          openEdgeMenuBar(element)
        }, 1000)
      } else {
        openEdgeMenuBar(element)
      }
    } else {
      if (!element) {
        setTimeout(() => {
          element = document.getElementById(selectedId.value!)
          openNodeMenuBar(element)
        }, 800)
      } else {
        openNodeMenuBar(element)
      }
    }
  } else {
    isEditMenuOpen.value = false
    selectedId.value = null
  }
})

watch(
  flowControl,
  (newValue) => {
    if (selectedId.value !== null && !flowControl.value.selected) {
      const element = document.getElementById(selectedId.value)
      useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
        position.value = pos
      })
    } else if (newValue.selected && selectedId.value) {
      const element = document.getElementById(`${selectedId.value}-process-group-${newValue.id}`)
      if (!element) {
        setTimeout(() => {
          const element = document.getElementById(
            `${selectedId.value}-process-group-${newValue.id}`
          )
          useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
            position.value = pos
          })
        }, 100)
      } else {
        useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
          position.value = pos
        })
      }
    }
  },
  {
    deep: true
  }
)

onNodeDragStart((dragEvent: NodeDragEvent) => {
  isEditMenuOpen.value = false
  if (dragEvent.node.type === NodeType.Process && dragEvent.nodes.length === 1) {
    nodePositionbeforeDrag = { x: dragEvent.node.position.x, y: dragEvent.node.position.y }
  }
})

onNodeDrag((dragEvent: NodeDragEvent) => {
  if (isEditMenuOpen.value) {
    isEditMenuOpen.value = false
  }
  if (dragEvent.node.type === NodeType.Process && dragEvent.nodes.length === 1) {
    checkIfNodeIsOverScheduleNode(dragEvent)
  }
})

onNodeDragStop((dragEvent: NodeDragEvent) => {
  if (dragEvent.node.type === NodeType.Process && dragEvent.nodes.length === 1) {
    checkIfNodeIsOverScheduleNode(dragEvent)
  }
  if (isNodeOverScheduleNode.value && intersectionScheduleNode.value) {
    const processNodeData = dragEvent.node.data.flowControl
    const scheduleNodeData = intersectionScheduleNode.value.data.scheduledFlowControl
    const flowControlSubprocesses = scheduleNodeData.processes
    const oldData = JSON.parse(JSON.stringify(scheduleNodeData))
    if (scheduleNodeData.totalDuration < processNodeData.duration) {
      scheduleNodeData.totalDuration = processNodeData.duration
    } else if (scheduleNodeData.totalDuration === 0 && processNodeData.duration === 0) {
      scheduleNodeData.totalDuration = 1
    }
    const subProcessId = getSubProcessId()
    flowControlSubprocesses.push({
      id: subProcessId,
      name: subProcessId,
      selected: false,
      startTime: 0,
      endTime: processNodeData.duration === 0 ? 1 : processNodeData.duration,
      duration: processNodeData.duration === 0 ? 1 : processNodeData.duration,
      inlet: processNodeData.inlet,
      injection: processNodeData.injection,
      fluid: processNodeData.fluid,
      pressure: processNodeData.pressure,
      flowrate: processNodeData.flowrate,
      inletState: processNodeData.inletState
    })

    isNodeOverScheduleNode.value = false

    const newData = JSON.parse(JSON.stringify(scheduleNodeData))
    const state: StateController = {
      type: ActionType.UPDATE_NODE_DATA_BY_DRAG_PROCESS,
      name: 'update node data ' + intersectionScheduleNode.value.id,
      objectId: [intersectionScheduleNode.value.id],
      oldState: [
        {
          objectPosition: intersectionScheduleNode.value.position,
          data: oldData
        }
      ],
      newState: [
        {
          objectPosition: intersectionScheduleNode.value.position,
          data: newData,
          changedSubprocessId: subProcessId
        }
      ]
    }
    addState(state)

    if (Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(dragEvent.node.id)
      state.oldState.push({
        objectPosition: nodePositionbeforeDrag,
        nodeType: dragEvent.node.type,
        data: dragEvent.node.data.flowControl
      })
    }
    removeNodes([dragEvent.node])

    return
  }
  dragEvent.node.data.isOverScheduleNode = false

  if (selectedId.value) {
    showMenuBar()
  }
})

onViewportChangeStart(() => {
  if (selectedId.value) {
    isEditMenuOpen.value = false
  }
})

onViewportChangeEnd(() => {
  if (selectedId.value) {
    showMenuBar()
  }
})

onEdgeUpdateStart((event) => {
  removeSelectedEdges([event.edge])
})

watch(isFlowChartCanvasZooming, (newValue) => {
  if (selectedId.value) {
    if (newValue) {
      isEditMenuOpen.value = false
    } else {
      showMenuBar()
    }
  }
})

const d3Drag = drag<HTMLDivElement, any, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
let x: number = 0
let y: number = 0
d3Drag.on('start', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  startOffsetX = event.x - position.value.x
  startOffsetY = event.y - position.value.y
})
d3Drag.on('drag', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  x = event.x - startOffsetX
  y = event.y - startOffsetY
  select('#menu-bar').style('top', `${y}px`).style('left', `${x}px`)
})
d3Drag.on('end', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  position.value.x = x
  position.value.y = y
})
d3Drag.filter(() => isDraggable.value)

watch(
  () => position.value,
  () => {
    if (floatingRef.value) {
      select(floatingRef.value).call(d3Drag)
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style scoped>
.wrapper {
  position: fixed;
  z-index: 10;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px;
  background-color: white;
  width: fit-content;
  height: fit-content;
  border-radius: 8px;
  box-shadow: 2px 2px 4px 0px rgba(128, 128, 128, 0.2);
}
.drag-button {
  display: flex;
  padding: 6px;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  margin-left: 4px;
  background-color: white;
  cursor: all-scroll;
}

.fade-appearance {
  animation: fadeIn 0.5s ease;
}
</style>
