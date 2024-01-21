export interface FlowControl {
  inlet: string
  injection: string
  fluid: string
  pressure: number
  duration: number
}

export interface FlowConfig {
  inlet: string
  injection: string
  fluid: string
  pressure: number
}

export interface FlowConfigs {
  startTime: number
  endTime: number
  duration: number
  flowControlList: FlowConfig[]
}

export interface ScheduledFlowControl {
  duration: number
  flowControlProcesses: FlowConfigs[]
}
