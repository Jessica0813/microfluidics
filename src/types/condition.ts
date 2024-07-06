import { type Sensor } from './sensor'
export interface Condition {
  name: string
  sensor: Sensor
  operator: string
  color: string
  measurement: number
}
