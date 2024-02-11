export interface FlowControl {
  name: string
  inlet: string
  injection: string
  fluid: string
  pressure: number
  duration: number
}

export interface scheduledFlowControl {
  totalDuration: number
  processes: FlowControlProcess[]
}

export interface FlowControlProcess {
  id: string
  name: string
  startTime: number
  endTime: number
  duration: number
  inlet: string
  injection: string
  fluid: string
  pressure: number
}
