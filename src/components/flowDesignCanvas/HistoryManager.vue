<template>
  <div class="d-flex button-group ml-4">
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
      class="icon-button with-right-border"
      title="redo"
      :disabled="!isRedoable"
      :class="isUndoable() ? '' : 'disable-hover'"
      @click="redo"
    >
      <v-icon size="small" :color="isRedoable() ? '#66615b' : '#BDBDBD'">mdi-redo</v-icon>
    </button>
    <v-menu offset="1">
      <template v-slot:activator="{ props }">
        <button class="icon-button" title="history" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-cached</v-icon>
        </button>
      </template>
      <div class="dropdown-menu">
        <button
          class="dropdown-item"
          v-for="(item, index) in undoList"
          :key="index"
          @click="undoToStep(index)"
        >
          {{ item.name }}
        </button>
        <button
          class="dropdown-item-withBackground"
          v-for="(item, index) in redoList"
          :key="index"
          @click="redoToStep(index)"
        >
          {{ item.name }}
        </button>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { useStateStore } from '@/stores/useStateStore'
import { ActionType } from '@/types/stateController'
import type { Connection } from '@vue-flow/core'
import { useSensorStore } from '@/stores/useSensorStore'
import type { Sensor } from '@/types/sensor'

const { undoState, redoState, isUndoable, isRedoable, redoList, undoList } = useStateStore()

const { removeEdges, removeNodes, findNode, addNodes, findEdge, addEdges } = useVueFlow()

const { editSensor, addSensor, deleteSensorWithId, toggleRecordState } = useSensorStore()

const shouldRecordState = defineModel<Boolean>('shouldRecordState', {
  default: true
})

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
        name: state.oldState.objectName || state.objectId,
        type: 'temperature',
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        radius: state.oldState.objectRadius || 20,
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
    case ActionType.UPDATE_SENSOR_TYPE: {
      toggleRecordState()
      editSensor(state.objectId, {
        type: state.oldState.objectType || 'temperature'
      })
      toggleRecordState()
      break
    }
    case ActionType.UPDATE_SENSOR_NAME: {
      toggleRecordState()
      editSensor(state.objectId, {
        name: state.oldState.objectName
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
    case ActionType.UPDATE_SENSOR_TYPE: {
      toggleRecordState()
      editSensor(state.objectId, {
        type: state.newState?.objectType || 'temperature'
      })
      toggleRecordState()
      break
    }
    case ActionType.UPDATE_SENSOR_NAME: {
      toggleRecordState()
      editSensor(state.objectId, {
        name: state.newState?.objectName
      })
      toggleRecordState()
      break
    }
  }

  shouldRecordState.value = true
}

function undoToStep(index: number) {
  for (let i = undoList.length; i > index; i--) {
    undo()
  }
}

function redoToStep(index: number) {
  for (let i = 0; i <= index; i++) {
    redo()
  }
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

.dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 8px 0px;
  background-color: white;
  border-radius: 4px;
  width: fit-content;
  border: 0.5px solid lightgray;
}

.dropdown-item {
  width: 100%;
  padding: 4px;
  font-size: 14px;
  padding: 4px 8px;
}

.dropdown-item:hover {
  background-color: #bdbdbd;
}

.dropdown-item-withBackground {
  width: 100%;
  padding: 4px;
  font-size: 14px;
  background-color: #e0e0e0;
  padding: 4px 8px;
}

.dropdown-item-withBackground:hover {
  background-color: #bdbdbd;
}
</style>
