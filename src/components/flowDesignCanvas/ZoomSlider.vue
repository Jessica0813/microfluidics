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
      class="icon-button with-right-border"
      title="undo"
      @click="undo"
      :disabled="!isUndoable()"
      :class="isUndoable() ? '' : 'disable-hover'"
    >
      <v-icon size="small" :color="isUndoable() ? '#66615b' : '#BDBDBD'">mdi-undo</v-icon>
    </button>
    <button
      class="icon-button"
      title="redo"
      :disabled="!isRedoable"
      :class="isUndoable() ? '' : 'disable-hover'"
      @click="redo"
    >
      <v-icon size="small" :color="isRedoable() ? '#66615b' : '#BDBDBD'">mdi-redo</v-icon>
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

const { undoState, redoState, isUndoable, isRedoable } = useStateStore()
const {
  zoomTo,
  viewport,
  removeEdges,
  removeNodes,
  setViewport,
  findNode,
  addNodes,
  findEdge,
  addEdges,
  project
} = useVueFlow()

const { editSensor, addSensor, deleteSensorWithId, toggleRecordState } = useSensorStore()

const zoom = ref(1)

const minZoomReached = toRef(() => viewport.value.zoom <= 0.2)
const maxZoomReached = toRef(() => viewport.value.zoom >= 2)

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
        type: state.oldState.objectType || 'process',
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        data: state.oldState.data
      }
      addNodes([node])
      break
    }
    case ActionType.MOVE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        node.position = state.oldState.objectPosition || { x: 0, y: 0 }
      }
      break
    }
    case ActionType.UPDATE_NODE_DATA: {
      const node = findNode(state.objectId)
      if (node) {
        const data = { ...state.oldState.data }
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
        source: state.oldState.source || '',
        target: state.oldState.target || '',
        sourceHandle: state.oldState.sourceHandleId,
        targetHandle: state.oldState.targetHandleId
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
        edge.source = state.oldState.source || ''
        edge.target = state.oldState.target || ''
        edge.sourceHandle = state.oldState.sourceHandleId
        edge.targetHandle = state.oldState.targetHandleId
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
        position: state.oldState.objectPosition || { x: 0, y: 0 },
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
          x: state.oldState.objectPosition?.x || 0,
          y: state.oldState.objectPosition?.y || 0
        }
      })
      toggleRecordState()
      break
    }
    case ActionType.RESIZE_SENSOR: {
      toggleRecordState()
      editSensor(state.objectId, {
        position: {
          x: state.oldState.objectPosition?.x || 0,
          y: state.oldState.objectPosition?.y || 0
        },
        radius: state.oldState.objectRadius || 20
      })
      toggleRecordState()
      break
    }
  }

  shouldRecordState.value = true
}

function redo() {
  shouldRecordState.value = false
  const state = redoState()
  if (!state) {
    shouldRecordState.value = true
    return
  }
  switch (state.type) {
    case ActionType.CREATE_NODE: {
      let node = {
        id: state.objectId,
        type: state.oldState.objectType || 'process',
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        data: {}
      }
      const data = { ...state.oldState.data }
      if (node.type === 'process') {
        node = { ...node, data: { flowControl: data } }
      } else if (node.type === 'condition') {
        node = { ...node, data: { condition: data } }
      } else if (node.type === 'schedule') {
        node = { ...node, data: { scheduledFlowControl: data } }
      }
      addNodes([node])
      break
    }
    case ActionType.DELETE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        removeNodes([node])
      }
      break
    }
    case ActionType.MOVE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        node.position = (state.newState && state.newState.objectPosition) || { x: 0, y: 0 }
      }
      break
    }
    case ActionType.UPDATE_NODE_DATA: {
      const node = findNode(state.objectId)
      if (node) {
        const data = { ...state.newState?.data }
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
      const edge: Connection = {
        source: state.oldState.source || '',
        target: state.oldState.target || '',
        sourceHandle: state.oldState.sourceHandleId,
        targetHandle: state.oldState.targetHandleId
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
    case ActionType.DELETE_EDGE: {
      const edge = findEdge(state.objectId)
      if (edge) {
        removeEdges([edge])
      }
      break
    }
    case ActionType.UPDATE_EDGE: {
      const edge = findEdge(state.objectId)
      if (edge) {
        edge.source = state.newState?.source || ''
        edge.target = state.newState?.target || ''
        edge.sourceHandle = state.newState?.sourceHandleId
        edge.targetHandle = state.newState?.targetHandleId
      }
      break
    }
    case ActionType.CREATE_SENSOR: {
      toggleRecordState()
      const sensor: Sensor = {
        id: state.objectId,
        name: state.objectId,
        type: 'temperature',
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        radius: 20,
        selected: false
      }
      addSensor(sensor)
      toggleRecordState()
      break
    }
    case ActionType.DELETE_SENSOR: {
      deleteSensorWithId(state.objectId)
      break
    }
    case ActionType.MOVE_SENSOR: {
      toggleRecordState()
      editSensor(state.objectId, {
        position: {
          x: state.newState?.objectPosition?.x || 0,
          y: state.newState?.objectPosition?.y || 0
        }
      })
      toggleRecordState()
      break
    }
    case ActionType.RESIZE_SENSOR: {
      toggleRecordState()
      editSensor(state.objectId, {
        position: {
          x: state.newState?.objectPosition?.x || 0,
          y: state.newState?.objectPosition?.y || 0
        },
        radius: state.newState?.objectRadius || 20
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
