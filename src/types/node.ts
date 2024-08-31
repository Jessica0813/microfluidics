import type { Fluid } from './fluid'
import { type Sensor } from './sensor'

export enum NodeType {
  Process = 'process',
  Condition = 'condition',
  Pause = 'pause',
  Schedule = 'schedule'
}

export interface Condition {
  sensor: Sensor
  operator: string
  color: string
  measurement: number
}

export interface FlowControl {
  inlet: string
  injection: string
  fluid: Fluid | null
  pressure: number
  duration: number
  flowrate: number
  inletState: string
}

export interface ScheduledFlowControl {
  totalDuration: number
  processes: FlowControlProcess[]
}

export interface FlowControlProcess {
  id: string
  selected: boolean
  startTime: number
  endTime: number
  duration: number
  inlet: string
  injection: string
  fluid: Fluid | null
  pressure: number
  flowrate: number
  inletState: string
}
