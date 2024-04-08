<template>
  <div class="d-flex align-center" style="width: 200px">
    <button @click="zoomOut" class="button" :disabled="minZoomReached">
      <IconZoomOut :color="minZoomReached ? '#BDBDBD' : ''" />
    </button>
    <v-slider
      v-model="zoom"
      min="0.2"
      max="2"
      color="#BDBDBD"
      :thumb-size="14"
      :hide-details="true"
      @update:modelValue="zoomBySlider"
    ></v-slider>
    <button @click="zoomIn" class="button" :disabled="maxZoomReached">
      <IconZoomIn :color="maxZoomReached ? '#BDBDBD' : ''" />
    </button>
  </div>
  <div class="d-flex button-group ml-4">
    <button class="icon-button with-right-border" title="reset the view" @click="resetView">
      <v-icon size="small" color="#66615b">mdi-image-filter-center-focus-weak</v-icon>
    </button>
    <button
      class="icon-button"
      :class="hasSelectedElements ? '' : 'disable-hover'"
      title="delete"
      @click="deleteSelectedElements"
      :disabled="!hasSelectedElements"
    >
      <v-icon size="small" :color="hasSelectedElements ? '#66615b' : '#c2c2be'"
        >mdi-trash-can-outline</v-icon
      >
    </button>
    <button class="icon-button with-right-border" title="undo" @click="undo">
      <v-icon size="small" color="#66615b">mdi-undo</v-icon>
    </button>
    <button class="icon-button" title="redo">
      <v-icon size="small" color="#66615b">mdi-redo</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import IconZoomIn from '../icons/IconZoomIn.vue'
import IconZoomOut from '../icons/IconZoomOut.vue'
import { useStateStore } from '@/stores/useStateStore'
import { ActionType } from '@/types/stateController'
import type { Connection } from '@vue-flow/core'
import { useSensorStore } from '@/stores/useSensorStore'
import type { Sensor } from '@/types/sensor'

const { undoState } = useStateStore()
const {
  zoomTo,
  viewport,
  getSelectedElements,
  removeEdges,
  removeNodes,
  setViewport,
  findNode,
  addNodes,
  findEdge,
  addEdges
} = useVueFlow()

const { editSensor, addSensor, getSensorId, deleteSensorWithId, toggleRecordState } =
  useSensorStore()

const zoom = ref(1)

const minZoomReached = toRef(() => viewport.value.zoom <= 0.2)
const maxZoomReached = toRef(() => viewport.value.zoom >= 2)

const hasSelectedElements = toRef(() => getSelectedElements.value.length > 0)

const shouldRecordState = defineModel<Boolean>('shouldRecordState', {
  default: true
})

watch(
  () => viewport.value,
  () => {
    zoom.value = viewport.value.zoom
  }
)

function zoomIn() {
  zoom.value = zoom.value + 0.1
  if (zoom.value > 2) {
    zoom.value = 2
  }
  zoomTo(zoom.value)
}

function zoomOut() {
  zoom.value = zoom.value - 0.1
  if (zoom.value < 0.2) {
    zoom.value = 0.2
  }
  zoomTo(zoom.value)
}

function zoomBySlider() {
  zoomTo(zoom.value)
}

function deleteSelectedElements() {
  getSelectedElements.value.forEach((element) => {
    if (element.type === 'custom') {
      removeEdges([element.id])
    } else if (
      element.type === 'condition' ||
      element.type === 'process' ||
      element.type === 'schedule'
    ) {
      removeNodes([element.id])
    }
  })
}

function resetView() {
  setViewport({ zoom: 1, x: 0, y: 0 })
}

function undo() {
  shouldRecordState.value = false
  const state = undoState()
  if (!state) {
    shouldRecordState.value = true
    return
  }
  switch (state.type) {
    case ActionType.CREATE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        removeNodes([node])
      }
      break
    }
    case ActionType.DELETE_NODE: {
      const node = {
        id: state.objectId,
        type: state.objectType || 'process',
        position: state.objectPosition || { x: 0, y: 0 },
        data: state.data
      }
      addNodes([node])
      break
    }
    case ActionType.MOVE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        node.position = state.objectPosition || { x: 0, y: 0 }
      }
      break
    }
    case ActionType.UPDATE_NODE_DATA: {
      const node = findNode(state.objectId)
      if (node) {
        const data = { ...state.data }
        if (node.type === 'process') {
          node.data.flowControl = data
        } else if (node.type === 'condition') {
          node.data.condition = data
        } else if (node.type === 'schedule') {
          node.data.scheduledFlowControl = data
        }
      }
      break
    }
    case ActionType.CREATE_EDGE: {
      const edge = findEdge(state.objectId)
      if (edge) {
        removeEdges([edge])
      }
      break
    }
    case ActionType.DELETE_EDGE: {
      const edge: Connection = {
        source: state.source || '',
        target: state.target || '',
        sourceHandle: state.sourceHandleId,
        targetHandle: state.targetHandleId
      }
      if (state.objectId.includes('edgeTrue')) {
        addEdges([{ ...edge, id: state.objectId, type: 'custom', label: 'Yes' }])
      } else if (state.objectId.includes('edgeFalse')) {
        addEdges([{ ...edge, id: state.objectId, type: 'custom', label: 'No' }])
      } else if (state.objectId.includes('edge')) {
        addEdges([{ ...edge, id: state.objectId, type: 'custom', label: '' }])
      }
      break
    }
    case ActionType.UPDATE_EDGE: {
      const edge = findEdge(state.objectId)
      if (edge) {
        edge.source = state.source || ''
        edge.target = state.target || ''
        edge.sourceHandle = state.sourceHandleId
        edge.targetHandle = state.targetHandleId
      }
      break
    }
    case ActionType.CREATE_SENSOR: {
      deleteSensorWithId(state.objectId)
      break
    }
    case ActionType.DELETE_SENSOR: {
      toggleRecordState()
      const sensor: Sensor = {
        id: state.objectId,
        name: state.objectId,
        type: 'temperature',
        position: state.objectPosition || { x: 0, y: 0 },
        radius: 20,
        selected: false
      }
      addSensor(sensor)
      toggleRecordState()
      break
    }
    case ActionType.MOVE_SENSOR: {
      toggleRecordState()
      editSensor(state.objectId, {
        position: {
          x: state.objectPosition?.x || 0,
          y: state.objectPosition?.y || 0
        }
      })
      toggleRecordState()
      break
    }
    case ActionType.RESIZE_SENSOR: {
      toggleRecordState()
      editSensor(state.objectId, {
        position: {
          x: state.objectPosition?.x || 0,
          y: state.objectPosition?.y || 0
        },
        radius: state.objectRadius || 20
      })
      toggleRecordState()
      break
    }
  }

  shouldRecordState.value = true
}
</script>

<style scoped>
.button {
  display: flex;
  align-items: center;
  padding: 5px, 0px;
}

.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
