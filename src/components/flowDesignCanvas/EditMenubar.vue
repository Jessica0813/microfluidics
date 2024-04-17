<template>
  <div ref="floatingRef" class="wrapper" v-show="isMenuBarOpen" id="menu-bar">
    <div class="drag-button" @mouseenter="isDraggable = true" @mouseleave="isDraggable = false">
      <v-icon size="small" color="#66615b">mdi-drag</v-icon>
    </div>
    <ProcessEditMenu v-if="findNode(selectedId)?.type === 'process'" :id="selectedId" />
    <ConditionEditMenu v-else-if="findNode(selectedId)?.type === 'condition'" :id="selectedId" />
    <ScheduledProcessEditMenu
      v-else-if="findNode(selectedId)?.type === 'schedule'"
      :id="selectedId"
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
import ConditionEditMenu from './ConditionEditMenu.vue'
import ScheduledProcessEditMenu from './ScheduledProcessEditMenu.vue'
import EdgeEditMenu from './EdgeEditMenu.vue'
import { select } from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'

const {
  findNode,
  findEdge,
  onNodeDragStart,
  onNodeDragStop,
  getSelectedElements,
  onViewportChangeStart,
  onViewportChangeEnd,
  viewport,
  vueFlowRef
} = useVueFlow()

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

function isNodeinView(nodeX: number, nodeY: number, width: number, height: number) {
  const { x, y, zoom } = viewport.value
  const screenX = (nodeX + x) * zoom
  const screenY = (nodeY + y) * zoom

  if (vueFlowRef.value === null) return
  const { left, top, right, bottom } = vueFlowRef.value.getBoundingClientRect()
  return screenX > left - width && screenY > top - height && screenX < right && screenY < bottom
}

const floatingRef = ref<HTMLDivElement | null>(null)
const isMenuBarOpen = ref(false)
const selectedId = ref<string | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDraggable = ref(false)

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
      isMenuBarOpen.value = true
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
    isMenuBarOpen.value = false
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
  useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
    position.value = pos
  })
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
    useMenuPositionCalculator(element, floatingRef.value).then((pos) => {
      position.value = pos
    })
  }
})

const d3Drag = drag<HTMLDivElement, any, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
let x: number = 0
let y: number = 0
d3Drag.on('start', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  console.log(event)
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
    deep: true
  }
)
</script>

<style scoped>
.wrapper {
  position: fixed;
  z-index: 3;
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
