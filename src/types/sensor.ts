export interface Sensor {
  id: string
  type: 'temperature' | 'speed'
  name: string
  position: { x: number; y: number }
  dimension: { width: number; height: number }
}

export interface Transform {
  x: number
  y: number
  k: number
}
