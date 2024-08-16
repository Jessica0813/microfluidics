import type { FlowControl, ScheduledFlowControl, Condition, NodeType } from './node'
import { type Sensor, SensorType } from './sensor'

export enum ActionType {
  CREATE_NODE = 'CREATE_NODE',
  DELETE_NODE = 'DELETE_NODE',
  MOVE_NODE = 'MOVE_NODE',
  UPDATE_NODE_DATA = 'UPDATE_NODE_DATA',
  CREATE_SENSOR = 'CREATE_SENSOR',
  DELETE_SENSOR = 'DELETE_SENSOR',
  MOVE_SENSOR = 'MOVE_SENSOR',
  RESIZE_SENSOR = 'RESIZE_SENSOR',
  UPDATE_SENSOR_NAME = 'UPDATE_SENSOR_NAME',
  UPDATE_SENSOR_TYPE = 'UPDATE_SENSOR_TYPE',
  CREATE_EDGE = 'CREATE_EDGE',
  DELETE_EDGE = 'DELETE_EDGE',
  UPDATE_EDGE = 'UPDATE_EDGE',
  MOVE_MULTI_NODES = 'MOVE_MULTI_NODES',
  DELETE_MULTI_NODES = 'DELETE_MULTI_NODES',
  DELETE_MULTI_EDGES = 'DELETE_MULTI_EDGES',
  DELETE_MULTI_ElEMENTS = 'DELETE_MULTI_ElEMENTS',
  MOVE_MULTI_SENSORS = 'MOVE_MULTI_SENSORS',
  Resize_MUlTI_SENSORS = 'Resize_MUlTI_SENSORS',
  DELETE_MULTI_SENSORS = 'DELETE_MULTI_SENSORS',
  PASTE_NODES = 'PASTE_NODES',
  PASTE_SENSORS = 'PASTE_SENSORS',
  UPDATE_NODE_DATA_BY_DRAG_PROCESS = 'UPDATE_NODE_DATA_BY_DRAG_PROCESS'
}

export interface state {
  objectName?: string
  objectPosition?: { x: number; y: number }
  objectType?: SensorType
  objectRadius?: number
  data: FlowControl | ScheduledFlowControl | Condition | Sensor | any
  nodeType?: NodeType | string
  changedSubprocessId?: string
  source?: string
  target?: string
  sourceHandleId?: string
  targetHandleId?: string
  edgeLabel?: string
}
export interface StateController {
  type: ActionType
  name: string
  objectId: string | string[]
  oldState: state | state[]
  newState?: state | state[]
}
