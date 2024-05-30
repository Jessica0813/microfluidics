<template>
  <div ref="floatingRef" class="wrapper" v-show="isEditMenuOpen" id="menu-bar">
    <div class="drag-button" @mouseenter="isDraggable = true" @mouseleave="isDraggable = false">
      <v-icon size="small" color="#66615b">mdi-drag</v-icon>
    </div>
    <ProcessEditMenu
      v-if="findNode(selectedId)?.type === 'process'"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <PauseEditMenu
      v-else-if="findNode(selectedId)?.type === 'pause'"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <ConditionEditMenu
      v-else-if="findNode(selectedId)?.type === 'condition'"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
    />
    <ScheduledProcessEditMenu
      v-else-if="findNode(selectedId)?.type === 'schedule'"
      :id="selectedId"
      :is-edit-menu-open="isEditMenuOpen"
      v-model:edited-flow-control="flowControl"
    />
    <EdgeEditMenu v-else-if="findEdge(selectedId)?.type === 'custom'" :id="selectedId" />
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'
import {
  useMenuPositionCalculator,
  useMenuPositionCalculatorForEdges
} from '@/composables/useMenuPositionCalculator'
import ProcessEditMenu from './ProcessEditMenu.vue'
import PauseEditMenu from './PauseEditMenu.vue'
import ConditionEditMenu from './ConditionEditMenu.vue'
import ScheduledProcessEditMenu from './ScheduledProcessEditMenu.vue'
import EdgeEditMenu from './EdgeEditMenu.vue'
import { select } from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'
import type { NodeDragEvent } from '@vue-flow/core'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'

const { getSubProcessId } = useNodeIdStore()
const { addState } = useStateStore()
const {
  findNode,
  findEdge,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  getSelectedElements,
  onViewportChangeStart,
  onViewportChangeEnd,
  viewport,
  vueFlowRef,
  removeNodes
} = useVueFlow()
const { getZooming } = useFlowChartCanvasStore()

const flowControl = ref({
  id: '-1',
  name: 'xyz',
  selected: false,
  startTime: 0.0,
  endTime: 1.0,
  duration: 1.0,
  inlet: 'inlet 1',
  injection: 'pump',
  fluid: 'water',
  pressure: 0,
  flowrate: 0
})

const floatingRef = ref<HTMLDivElement | null>(null)
const isEditMenuOpen = ref(false)
const selectedId = ref<string | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDraggable = ref(false)
const isNodeOverScheduleNode = ref(false)
let nodePositionbeforeDrag = { x: 0, y: 0 }

function isNodeinView(nodeX: number, nodeY: number, width: number, height: number) {
  if (vueFlowRef.value === null) return

  const { x, y, zoom } = viewport.value
  const screenX = nodeX * zoom + x
  const screenY = nodeY * zoom + y
  const widthWithZoom = width * zoom
  const heightWithZoom = height * zoom

  const { left, top, right, bottom } = vueFlowRef.value.getBoundingClientRect()
  return (
    screenX + widthWithZoom > left &&
    screenY + heightWithZoom > top &&
    screenX < right &&
    screenY < bottom
  )
}

function showEditMenuBar() {
  const node = findNode(selectedId.value!)

  if (!node) {
    return
  }

  if (
    !isNodeinView(node.position.x, node.position.y, node.dimensions.width, node.dimensions.height)
  ) {
    return
  }

  const element = document.getElementById(selectedId.value!)
  useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
    position.value = pos
  })
  isEditMenuOpen.value = true
}

function checkIfNodeIsOverScheduleNode(dragEvent: NodeDragEvent) {
  if (dragEvent.nodes.length > 1) {
    return
  }
  if (dragEvent.node.type !== 'process') {
    return
  }
  if (dragEvent.intersections !== undefined) {
    if (dragEvent.intersections.length === 0) {
      isNodeOverScheduleNode.value = false
      dragEvent.node.data.isOverScheduleNode = false
      return
    }
    dragEvent.intersections.forEach((intersection) => {
      if (intersection.type === 'schedule') {
        const scheduleNode = document.getElementById(intersection.id)
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
        } else {
          isNodeOverScheduleNode.value = false
          dragEvent.node.data.isOverScheduleNode = false
        }
      } else {
        isNodeOverScheduleNode.value = false
        dragEvent.node.data.isOverScheduleNode = false
      }
    })
  } else {
    isNodeOverScheduleNode.value = false
    dragEvent.node.data.isOverScheduleNode = false
  }
}

watch(getSelectedElements, (newSelectedElements, oldSelectedElements) => {
  if (
    newSelectedElements.length === 1 &&
    oldSelectedElements.length === 1 &&
    newSelectedElements[0].id === oldSelectedElements[0].id
  ) {
    return
  }
  if (newSelectedElements.length === 1) {
    if (selectedId.value === null) {
      selectedId.value = newSelectedElements[0].id
      isEditMenuOpen.value = true
    } else if (newSelectedElements[0] !== oldSelectedElements[0]) {
      selectedId.value = newSelectedElements[0].id
    }
    if (selectedId.value.includes('edge')) {
      const element = document.getElementById(selectedId.value!)
      useMenuPositionCalculatorForEdges(element, floatingRef.value).then((pos) => {
        position.value = pos
      })
      return
    }
    const element = document.getElementById(selectedId.value!)
    useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
      position.value = pos
    })
  } else {
    isEditMenuOpen.value = false
    selectedId.value = null
  }
})

watch(
  flowControl,
  (newValue, oldValue) => {
    if (selectedId.value !== null && !flowControl.value.selected) {
      const element = document.getElementById(selectedId.value)
      useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
        position.value = pos
      })
    }
    if (newValue.selected && selectedId.value && newValue.id !== oldValue.id) {
      const element = document.getElementById(`${selectedId.value}-process-group-${newValue.id}`)
      useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
        position.value = pos
      })
    }
  },
  {
    deep: true
  }
)

onNodeDragStart((dragEvent: NodeDragEvent) => {
  isEditMenuOpen.value = false
  if (dragEvent.node.type === 'process' && dragEvent.nodes.length === 1) {
    nodePositionbeforeDrag = { x: dragEvent.node.position.x, y: dragEvent.node.position.y }
  }
})

onNodeDrag((dragEvent: NodeDragEvent) => {
  checkIfNodeIsOverScheduleNode(dragEvent)
})

onNodeDragStop((dragEvent: NodeDragEvent) => {
  checkIfNodeIsOverScheduleNode(dragEvent)
  if (isNodeOverScheduleNode.value && dragEvent.intersections) {
    const processNodeData = dragEvent.node.data.flowControl
    const scheduleNodeData = dragEvent.intersections[0].data.scheduledFlowControl
    const flowControlSubprocesses = scheduleNodeData.processes
    const oldData = JSON.parse(JSON.stringify(scheduleNodeData))
    const subProcessId = getSubProcessId()
    flowControlSubprocesses.push({
      id: subProcessId,
      name: subProcessId,
      selected: false,
      startTime: 0.0,
      endTime: processNodeData.duration === 0 ? 1.0 : processNodeData.duration,
      duration: processNodeData.duration === 0 ? 1.0 : processNodeData.duration,
      inlet: processNodeData.inlet,
      injection: processNodeData.injection,
      fluid: processNodeData.fluid,
      pressure: processNodeData.pressure,
      flowrate: processNodeData.flowrate
    })

    isNodeOverScheduleNode.value = false

    const newData = JSON.parse(JSON.stringify(scheduleNodeData))
    const state: StateController = {
      type: ActionType.UPDATE_NODE_DATA_BY_DRAG_PROCESS,
      name: 'update node data ' + dragEvent.intersections[0].id,
      objectId: [dragEvent.intersections[0].id],
      oldState: [
        {
          objectPosition: dragEvent.intersections[0].position,
          data: oldData
        }
      ],
      newState: [
        {
          objectPosition: dragEvent.intersections[0].position,
          data: newData
        }
      ]
    }
    addState(state)

    if (Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(dragEvent.node.id)
      state.oldState.push({
        objectPosition: nodePositionbeforeDrag,
        objectType: dragEvent.node.type,
        data: dragEvent.node.data.flowControl
      })
    }
    removeNodes([dragEvent.node])

    return
  }
  dragEvent.node.data.isOverScheduleNode = false

  if (selectedId.value) {
    showEditMenuBar()
  }
})

onViewportChangeStart(() => {
  if (selectedId.value) {
    isEditMenuOpen.value = false
  }
})

onViewportChangeEnd(() => {
  if (selectedId.value) {
    showEditMenuBar()
  }
})

watch(
  () => getZooming(),
  (newValue) => {
    if (selectedId.value) {
      if (newValue) {
        isEditMenuOpen.value = false
      } else {
        showEditMenuBar()
      }
    }
  }
)

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
</style>
