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
  SENSOR_DATA_CHANGE = 'SENSOR_DATA_CHANGE'
}

export interface StateController {
  type: ActionType
  name: string
  objectId: string
  objectPosition?: { x: number; y: number }
  objectRadius?: number
  data: FlowControl | ScheduledFlowControl | Condition | Sensor | any
}
