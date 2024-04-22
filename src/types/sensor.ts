export interface Sensor {
  id: string
  type: 'temperature' | 'speed' | string
  name: string
  position: { x: number; y: number }
  radius: number
  selected: boolean
}
