import type { FlowControl, ScheduledFlowControl } from './flowControl'
import type { Condition } from './condition'
import type { Sensor } from './sensor'

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
  UPDATE_EDGE = 'UPDATE_EDGE'
}

export interface state {
  objectName?: string
  objectPosition?: { x: number; y: number }
  objectType?: string
  objectRadius?: number
  data: FlowControl | ScheduledFlowControl | Condition | Sensor | any
  source?: string
  target?: string
  sourceHandleId?: string
  targetHandleId?: string
}
export interface StateController {
  type: ActionType
  name: string
  objectId: string
  oldState: state
  newState?: state
}
