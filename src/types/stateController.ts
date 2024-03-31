import type { FlowControl, ScheduledFlowControl } from './flowControl'
import type { Condition } from './condition'
import type { Sensor } from './sensor'

export interface StateController {
  name: string
  data: FlowControl | ScheduledFlowControl | Condition | Sensor
}
