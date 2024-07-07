import type { Fluid } from './fluid'
export interface FlowControl {
  inlet: string
  injection: string
  fluid: Fluid | null
  pressure: number
  duration: number
  flowrate: number
}

export interface ScheduledFlowControl {
  totalDuration: number
  name: string
  processes: FlowControlProcess[]
}

export interface FlowControlProcess {
  id: string
  name: string
  selected: boolean
  startTime: number
  endTime: number
  duration: number
  inlet: string
  injection: string
  fluid: Fluid | null
  pressure: number
  flowrate: number
}
