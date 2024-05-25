<template>
  <div></div>
</template>
<script setup lang="ts">
import hotkeys from 'hotkeys-js'
import {
  createDeleteNodeState,
  createDeleteEdgeState,
  createDeleteMultiEdgesState,
  createDeleteMultiNodesState
} from '@/composables/useStateCreation'
import { useClipboardStore } from '@/stores/useClipboardStore'
import { ObjectType } from '@/stores/useClipboardStore'
import { useSensorStore } from '@/stores/useSensorStore'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { useNodeIdStore } from '@/stores/useNodeIdStore'

const { getProcessNodeId, getConditionNodeId, getProcessScheduleNodeId } = useNodeIdStore()

const {
  findNode,
  addNodes,
  getSelectedEdges,
  getSelectedNodes,
  removeNodes,
  removeEdges,
  getConnectedEdges,
  removeSelectedNodes
} = useVueFlow()

const { copyToClipboard, pasteFromClipboard, getContentsType } = useClipboardStore()

const {
  getSelectedSensors,
  deleteSelectedSensor,
  addSensor,
  toggleRecordState,
  getSensorId,
  onSelectMultiSensors,
  removeAllSelectedSensors,
  sensors
} = useSensorStore()

const { addState } = useStateStore()

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

  if (getSelectedSensors().length > 0) {
    deleteSelectedSensor()
  }
})

hotkeys('command+c', function (event) {
  event.preventDefault()
  let selectedIds: string[] = []
  if (getSelectedNodes.value.length > 0) {
    selectedIds = getSelectedNodes.value.map((node) => node.id)
  }

  if (getSelectedSensors().length > 0) {
    selectedIds = getSelectedSensors().map((sensor) => sensor.id)
  }

  copyToClipboard(selectedIds)
})

hotkeys('command+v', function (event) {
  event.preventDefault()
  const contentsType = getContentsType()
  const copiedIds: string[] = pasteFromClipboard()
  if (contentsType === ObjectType.SENSOR) {
    const state: StateController = {
      type: ActionType.PASTE_SENSORS,
      name: 'paste nodes',
      objectId: [],
      oldState: [],
      newState: []
    }
    let newIds: string[] = []
    toggleRecordState()
    copiedIds.forEach((id) => {
      const sensor = sensors.find((sensor) => sensor.id === id)
      if (sensor) {
        let newId = getSensorId()
        const newSensor = {
          id: newId,
          name: newId,
          type: sensor.type,
          position: { x: sensor.position.x, y: sensor.position.y + 2 * sensor.radius + 10 },
          radius: sensor.radius,
          selected: false
        }
        addSensor(newSensor)
        if (Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
          state.objectId.push(newId)
          state.oldState.push({
            objectPosition: newSensor.position,
            objectType: newSensor.type,
            objectRadius: newSensor.radius,
            data: ''
          })
        }
        newIds.push(newId)
      }
    })
    toggleRecordState()
    if (state.objectId.length > 0) {
      addState(state)
    }
    removeAllSelectedSensors()
    onSelectMultiSensors(newIds)
  } else if (contentsType === ObjectType.NODE) {
    const state: StateController = {
      type: ActionType.PASTE_NODES,
      name: 'paste nodes',
      objectId: [],
      oldState: [],
      newState: []
    }
    let newIds: string[] = []
    copiedIds.forEach((id) => {
      const node = findNode(id)
      if (node) {
        removeSelectedNodes([node])
        let newId = ''
        if (node.type === 'process') {
          newId = getProcessNodeId()
        } else if (node.type === 'condition') {
          newId = getConditionNodeId()
        } else if (node.type === 'schedule') {
          newId = getProcessScheduleNodeId()
        }
        newIds.push(newId)
        const newNode = {
          id: newId,
          type: node.type,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
          data: node.data
        }
        addNodes([newNode])

        if (Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
          state.objectId.push(newId)
          state.oldState.push({
            objectPosition: { x: node.position.x + 50, y: node.position.y + 50 },
            objectType: node.type,
            data: node.data
          })
        }
      }
    })
    if (state.objectId.length > 0) {
      addState(state)
    }

    setTimeout(() => {
      for (let i = 0; i < newIds.length; i++) {
        const node = findNode(newIds[i])
        if (node) {
          node.selected = true
        }
      }
    }, 50)
  }
})
</script>