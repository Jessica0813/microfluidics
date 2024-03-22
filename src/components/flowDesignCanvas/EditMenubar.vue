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
    />
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'
import { useMenuPositionCalculator } from '@/composables/useMenuPositionCalculator'
import ProcessEditMenu from './ProcessEditMenu.vue'
import ConditionEditMenu from './ConditionEditMenu.vue'
import ScheduledProcessEditMenu from './ScheduledProcessEditMenu.vue'
import { select } from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'

const {
  findNode,
  onNodeDragStart,
  onNodeDragStop,
  getSelectedNodes,
  onViewportChangeStart,
  onViewportChangeEnd,
  viewport,
  vueFlowRef,
  removeNodes
} = useVueFlow()

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

watch(getSelectedNodes, (newSelectedNodes, oldSelectedNodes) => {
  if (
    newSelectedNodes.length === 1 &&
    oldSelectedNodes.length === 1 &&
    newSelectedNodes[0].id === oldSelectedNodes[0].id
  ) {
    return
  }
  if (newSelectedNodes.length === 1) {
    if (selectedId.value === null) {
      selectedId.value = newSelectedNodes[0].id
      isMenuBarOpen.value = true
    } else if (newSelectedNodes[0] !== oldSelectedNodes[0]) {
      selectedId.value = newSelectedNodes[0].id
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
