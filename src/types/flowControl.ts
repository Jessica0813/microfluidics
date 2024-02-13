export interface FlowControl {
  name: string
  inlet: string
  injection: string
  fluid: string
  pressure: number
  duration: number
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
  fluid: string
  pressure: number
}
