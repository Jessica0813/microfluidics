<template>
  <div class="d-flex button-group ml-4">
    <button
      class="icon-button with-right-border"
      title="undo"
      @click="undo"
      :disabled="undoList.length === 0"
      :class="undoList.length > 0 ? '' : 'disable-hover'"
    >
      <v-icon size="small" :color="undoList.length > 0 ? '#66615b' : '#BDBDBD'">mdi-undo</v-icon>
    </button>
    <button
      class="icon-button with-right-border"
      title="redo"
      :disabled="redoList.length === 0"
      :class="redoList.length > 0 ? '' : 'disable-hover'"
      @click="redo"
    >
      <v-icon size="small" :color="redoList.length > 0 ? '#66615b' : '#BDBDBD'">mdi-redo</v-icon>
    </button>
    <v-menu offset="1">
      <template v-slot:activator="{ props }">
        <button class="icon-button" title="history" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-cached</v-icon>
        </button>
      </template>

      <div class="dropdown-menu" v-if="undoList.length > 0 && redoList.length > 0">
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
import { storeToRefs } from 'pinia'
import { useVueFlow } from '@vue-flow/core'
import type { Connection } from '@vue-flow/core'
import hotkeys from 'hotkeys-js'

import { ActionType } from '@/types/stateController'
import { type Sensor, SensorType } from '@/types/sensor'
import { NodeType, type FlowControlProcess } from '@/types/node'

import { useStateStore } from '@/stores/useStateStore'
import { useSensorStore } from '@/stores/useSensorStore'
import { useFluidStore } from '@/stores/useFluidStore'

const { undoState, redoState, toggleShouldRecordState } = useStateStore()
const { redoList, undoList } = storeToRefs(useStateStore())

const { removeEdges, removeNodes, findNode, addNodes, findEdge, addEdges, removeSelectedElements } =
  useVueFlow()

const { editSensor, addSensor, deleteSensorWithId, removeAllSelectedSensors, findSensor } =
  useSensorStore()

const { getFluidById } = useFluidStore()

function undo() {
  removeAllSelectedSensors()
  removeSelectedElements()
  toggleShouldRecordState()
  const state = undoState()
  if (!state) {
    toggleShouldRecordState()
    return
  }
  if (Array.isArray(state.oldState) || typeof state.objectId !== 'string') {
    if (Array.isArray(state.oldState) && Array.isArray(state.objectId)) {
      switch (state.type) {
        case ActionType.MOVE_MULTI_NODES: {
          for (let i = 0; i < state.objectId.length; i++) {
            const node = findNode(state.objectId[i])
            if (node) {
              node.position = state.oldState[i].objectPosition || { x: 0, y: 0 }
              node.selected = true
            }
          }
          break
        }
        case ActionType.DELETE_MULTI_ElEMENTS:
        case ActionType.DELETE_NODE: {
          if (state.oldState.length === state.objectId.length) {
            for (let i = state.objectId.length - 1; i >= 0; i--) {
              if (
                state.objectId[i].includes('process') ||
                state.objectId[i].includes('condition') ||
                state.objectId[i].includes('pause') ||
                state.objectId[i].includes('schedule')
              ) {
                const node = {
                  id: state.objectId[i],
                  type: state.oldState[i].nodeType || NodeType.Process,
                  position: state.oldState[i].objectPosition || { x: 0, y: 0 },
                  data: {},
                  selected: true
                }
                if (state.objectId[i].includes('process')) {
                  node.data = { flowControl: state.oldState[i].data }
                } else if (state.objectId[i].includes('condition')) {
                  node.data = { condition: state.oldState[i].data }
                } else if (state.objectId[i].includes('pause')) {
                  node.data = { pause: state.oldState[i].data }
                } else if (state.objectId[i].includes('schedule')) {
                  node.data = { scheduledFlowControl: state.oldState[i].data }
                }
                addNodes([node])
              } else if (state.objectId[i].includes('edge')) {
                const edge = {
                  source: state.oldState[i].source || '',
                  target: state.oldState[i].target || '',
                  sourceHandle: state.oldState[i].sourceHandleId,
                  targetHandle: state.oldState[i].targetHandleId
                }
                if (state.objectId[i].includes('edgeTrue')) {
                  addEdges([{ ...edge, id: state.objectId[i], type: 'custom', label: 'Yes' }])
                } else if (state.objectId[i].includes('edgeFalse')) {
                  addEdges([{ ...edge, id: state.objectId[i], type: 'custom', label: 'No' }])
                } else if (state.objectId[i].includes('edge')) {
                  addEdges([{ ...edge, id: state.objectId[i], type: 'custom', label: '' }])
                }
                const readdedEdge = findEdge(state.objectId[i])
                if (readdedEdge) {
                  readdedEdge.selected = true
                }
              }
            }
          }
          break
        }
        case ActionType.MOVE_MULTI_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            editSensor(state.objectId[i], {
              position: {
                x: state.oldState[i].objectPosition?.x || 0,
                y: state.oldState[i].objectPosition?.y || 0
              },
              selected: true
            })
          }
          break
        }
        case ActionType.DELETE_MULTI_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            const sensor: Sensor = {
              id: state.objectId[i],
              name: state.oldState[i].objectName || state.objectId[i],
              type: state.oldState[i].objectType || SensorType.Temperature,
              position: state.oldState[i].objectPosition || { x: 0, y: 0 },
              radius: state.oldState[i].objectRadius || 15,
              selected: true
            }
            addSensor(sensor)
          }
          break
        }
        case ActionType.PASTE_NODES: {
          for (let i = 0; i < state.objectId.length; i++) {
            const node = findNode(state.objectId[i])
            if (node) {
              removeNodes([node])
            }
          }
          break
        }
        case ActionType.PASTE_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            deleteSensorWithId(state.objectId[i])
          }
          break
        }
        case ActionType.UPDATE_NODE_DATA_BY_DRAG_PROCESS: {
          const scheduleNode = findNode(state.objectId[0])
          if (scheduleNode && scheduleNode.type === NodeType.Schedule) {
            scheduleNode.data.scheduledFlowControl = state.oldState[0].data
            scheduleNode.selected = true
          }
          const node = {
            id: state.objectId[1],
            type: state.oldState[1].nodeType || NodeType.Process,
            position: state.oldState[1].objectPosition || { x: 0, y: 0 },
            data: state.oldState[1].data,
            selected: true
          }
          addNodes([node])
          break
        }
      }
    }
    toggleShouldRecordState()
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
    case ActionType.MOVE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        node.position = state.oldState.objectPosition || { x: 0, y: 0 }
        node.selected = true
      }
      break
    }
    case ActionType.UPDATE_NODE_DATA: {
      const node = findNode(state.objectId)
      if (node) {
        const data = { ...state.oldState.data }
        if (node.type === NodeType.Process) {
          node.data.flowControl = data
          node.data.isOverScheduleNode = false
          if (node.data.flowControl.fluid !== null) {
            const fluid = getFluidById(node.data.flowControl.fluid.id)
            if (fluid) {
              node.data.flowControl.fluid = fluid
            }
          }
        } else if (node.type === NodeType.Pause) {
          node.data.pause = data
        } else if (node.type === NodeType.Condition) {
          node.data.condition = data
          if (node.data.condition.sensor !== null) {
            const sensor = findSensor(node.data.condition.sensor.id)
            if (sensor) {
              node.data.condition.sensor = sensor
            }
          }
        } else if (node.type === NodeType.Schedule) {
          node.data.scheduledFlowControl = data
          if (state.oldState.changedSubprocessId) {
            const id = state.oldState.changedSubprocessId
            const subprocess = node.data.scheduledFlowControl.processes.find(
              (process: FlowControlProcess) => process.id === id
            )
            if (subprocess) {
              subprocess.selected = true
            }
          }
          for (const process of node.data.scheduledFlowControl.processes) {
            if (process.fluid !== null) {
              const fluid = getFluidById(process.fluid.id)
              if (fluid) {
                process.fluid = fluid
              }
            }
          }
        }
        node.selected = true
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
      const readdedEdge = findEdge(state.objectId)
      if (readdedEdge) {
        readdedEdge.selected = true
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
        edge.selected = true
      }
      break
    }
    case ActionType.CREATE_SENSOR: {
      deleteSensorWithId(state.objectId)
      break
    }
    case ActionType.DELETE_SENSOR: {
      const sensor: Sensor = {
        id: state.objectId,
        name: state.oldState.objectName || state.objectId,
        type: state.oldState.objectType || SensorType.Temperature,
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        radius: state.oldState.objectRadius || 15,
        selected: true
      }
      addSensor(sensor)
      break
    }
    case ActionType.MOVE_SENSOR: {
      editSensor(state.objectId, {
        position: {
          x: state.oldState.objectPosition?.x || 0,
          y: state.oldState.objectPosition?.y || 0
        },
        selected: true
      })
      break
    }
    case ActionType.RESIZE_SENSOR: {
      editSensor(state.objectId, {
        position: {
          x: state.oldState.objectPosition?.x || 0,
          y: state.oldState.objectPosition?.y || 0
        },
        radius: state.oldState.objectRadius || 15,
        selected: true
      })
      break
    }
    case ActionType.UPDATE_SENSOR_TYPE: {
      editSensor(state.objectId, {
        type: state.oldState.objectType || SensorType.Temperature,
        selected: true
      })
      break
    }
    case ActionType.UPDATE_SENSOR_NAME: {
      editSensor(state.objectId, {
        name: state.oldState.objectName,
        selected: true
      })
      break
    }
  }

  toggleShouldRecordState()
}

function redo() {
  removeAllSelectedSensors()
  removeSelectedElements()
  toggleShouldRecordState()
  const state = redoState()
  if (!state) {
    toggleShouldRecordState()
    return
  }
  if (
    Array.isArray(state.oldState) ||
    Array.isArray(state.newState) ||
    typeof state.objectId !== 'string'
  ) {
    if (
      Array.isArray(state.oldState) &&
      Array.isArray(state.objectId) &&
      Array.isArray(state.newState)
    ) {
      switch (state.type) {
        case ActionType.MOVE_MULTI_NODES: {
          for (let i = 0; i < state.objectId.length; i++) {
            const node = findNode(state.objectId[i])
            if (node) {
              node.position = state.newState[i].objectPosition || { x: 0, y: 0 }
              node.selected = true
            }
          }
          break
        }
        case ActionType.DELETE_MULTI_ElEMENTS:
        case ActionType.DELETE_NODE: {
          if (state.oldState.length === state.objectId.length) {
            for (let i = 0; i < state.objectId.length; i++) {
              if (
                state.objectId[i].includes('process') ||
                state.objectId[i].includes('condition') ||
                state.objectId[i].includes('pause') ||
                state.objectId[i].includes('schedule')
              ) {
                const node = findNode(state.objectId[i])
                if (node) {
                  removeNodes([node])
                }
              } else if (state.objectId[i].includes('edge')) {
                const edge = findEdge(state.objectId[i])
                if (edge) {
                  removeEdges([edge])
                }
              }
            }
          }
          break
        }
        case ActionType.MOVE_MULTI_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            editSensor(state.objectId[i], {
              position: {
                x: state.newState[i].objectPosition?.x || 0,
                y: state.newState[i].objectPosition?.y || 0
              },
              selected: true
            })
          }
          break
        }
        case ActionType.DELETE_MULTI_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            deleteSensorWithId(state.objectId[i])
          }
          break
        }
        case ActionType.PASTE_NODES: {
          for (let i = 0; i < state.objectId.length; i++) {
            let node = {
              id: state.objectId[i],
              type: state.oldState[i].nodeType || NodeType.Process,
              position: state.oldState[i].objectPosition || { x: 0, y: 0 },
              data: state.oldState[i].data,
              selected: true
            }
            addNodes([node])
          }
          break
        }
        case ActionType.PASTE_SENSORS: {
          for (let i = 0; i < state.objectId.length; i++) {
            const sensor: Sensor = {
              id: state.objectId[i],
              name: state.oldState[i].objectName || state.objectId[i],
              type: state.oldState[i].objectType || SensorType.Temperature,
              position: state.oldState[i].objectPosition || { x: 0, y: 0 },
              radius: state.oldState[i].objectRadius || 15,
              selected: true
            }
            addSensor(sensor)
          }
          break
        }
        case ActionType.UPDATE_NODE_DATA_BY_DRAG_PROCESS: {
          const scheduleNode = findNode(state.objectId[0])
          if (scheduleNode && scheduleNode.type === NodeType.Schedule) {
            scheduleNode.data.scheduledFlowControl = state.newState[0].data
            scheduleNode.selected = true
            if (state.newState[0].changedSubprocessId) {
              const id = state.newState[0].changedSubprocessId
              const subprocess = scheduleNode.data.scheduledFlowControl.processes.find(
                (process: FlowControlProcess) => process.id === id
              )
              if (subprocess) {
                subprocess.selected = true
              }
            }
          }
          const processNode = findNode(state.objectId[1])
          if (processNode) {
            removeNodes([processNode])
          }
          break
        }
      }
    }
    toggleShouldRecordState()
    return
  }
  switch (state.type) {
    case ActionType.CREATE_NODE: {
      let node = {
        id: state.objectId,
        type: state.oldState.nodeType || NodeType.Process,
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        data: {},
        selected: true
      }
      const data = { ...state.oldState.data }
      if (node.type === NodeType.Process) {
        node = { ...node, data: { flowControl: data } }
      } else if (node.type === NodeType.Condition) {
        node = { ...node, data: { condition: data } }
      } else if (node.type === NodeType.Pause) {
        node = { ...node, data: { pause: data } }
      } else if (node.type === NodeType.Schedule) {
        node = { ...node, data: { scheduledFlowControl: data } }
      }
      addNodes([node])
      break
    }
    case ActionType.MOVE_NODE: {
      const node = findNode(state.objectId)
      if (node) {
        node.position = (state.newState && state.newState.objectPosition) || { x: 0, y: 0 }
        node.selected = true
      }
      break
    }
    case ActionType.UPDATE_NODE_DATA: {
      const node = findNode(state.objectId)
      if (node) {
        const data = { ...state.newState?.data }
        if (node.type === NodeType.Process) {
          node.data.flowControl = data
          node.data.isOverScheduleNode = false
          if (node.data.flowControl.fluid !== null) {
            const fluid = getFluidById(node.data.flowControl.fluid.id)
            if (fluid) {
              node.data.flowControl.fluid = fluid
            }
          }
        } else if (node.type === NodeType.Pause) {
          node.data.pause = data
        } else if (node.type === NodeType.Condition) {
          node.data.condition = data
          if (node.data.condition.sensor !== null) {
            const sensor = findSensor(node.data.condition.sensor.id)
            if (sensor) {
              node.data.condition.sensor = sensor
            }
          }
        } else if (node.type === NodeType.Schedule) {
          node.data.scheduledFlowControl = data
          if (state.newState?.changedSubprocessId) {
            const id = state.newState?.changedSubprocessId
            const subprocess = node.data.scheduledFlowControl.processes.find(
              (process: FlowControlProcess) => process.id === id
            )
            if (subprocess) {
              subprocess.selected = true
            }
          }
          for (const process of node.data.scheduledFlowControl.processes) {
            if (process.fluid !== null) {
              const fluid = getFluidById(process.fluid.id)
              if (fluid) {
                process.fluid = fluid
              }
            }
          }
        }
        node.selected = true
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
      const readdedEdge = findEdge(state.objectId)
      if (readdedEdge) {
        readdedEdge.selected = true
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
        edge.selected = true
      }
      break
    }
    case ActionType.CREATE_SENSOR: {
      const sensor: Sensor = {
        id: state.objectId,
        name: state.oldState.objectName || state.objectId,
        type: state.oldState.objectType || SensorType.Temperature,
        position: state.oldState.objectPosition || { x: 0, y: 0 },
        radius: state.oldState.objectRadius || 15,
        selected: true
      }
      addSensor(sensor)
      break
    }
    case ActionType.DELETE_SENSOR: {
      deleteSensorWithId(state.objectId)
      break
    }
    case ActionType.MOVE_SENSOR: {
      editSensor(state.objectId, {
        position: {
          x: state.newState?.objectPosition?.x || 0,
          y: state.newState?.objectPosition?.y || 0
        },
        selected: true
      })
      break
    }
    case ActionType.RESIZE_SENSOR: {
      editSensor(state.objectId, {
        position: {
          x: state.newState?.objectPosition?.x || 0,
          y: state.newState?.objectPosition?.y || 0
        },
        radius: state.newState?.objectRadius || 15,
        selected: true
      })
      break
    }
    case ActionType.UPDATE_SENSOR_TYPE: {
      editSensor(state.objectId, {
        type: state.newState?.objectType || SensorType.Temperature,
        selected: true
      })
      break
    }
    case ActionType.UPDATE_SENSOR_NAME: {
      editSensor(state.objectId, {
        name: state.newState?.objectName,
        selected: true
      })
      break
    }
  }

  toggleShouldRecordState()
}

function undoToStep(index: number) {
  for (let i = undoList.value.length; i > index; i--) {
    undo()
  }
}

function redoToStep(index: number) {
  for (let i = 0; i <= index; i++) {
    redo()
  }
}

hotkeys('ctrl+z, command+z', function (event) {
  event.preventDefault()
  if (undoList.value.length > 0) {
    undo()
  }
})

hotkeys('ctrl+y, command+y', function (event) {
  event.preventDefault()
  if (redoList.value.length > 0) {
    redo()
  }
})
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
  padding: 4px;
  background-color: white;
  border-radius: 4px;
  width: fit-content;
  border: 0.5px solid lightgray;
}

.dropdown-item {
  width: 100%;
  padding: 4px;
  font-size: 12px;
  padding: 4px 8px;
}

.dropdown-item:hover {
  background-color: #eeeeee;
}

.dropdown-item-withBackground {
  width: 100%;
  padding: 4px;
  font-size: 12px;
  background-color: #e0e0e0;
  padding: 4px 8px;
}

.dropdown-item-withBackground:hover {
  background-color: #bdbdbd;
}
</style>
@/types/node
