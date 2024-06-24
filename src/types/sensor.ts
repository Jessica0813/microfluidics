export interface Sensor {
  id: string
  type: 'temperature' | 'viscosity' | 'color' | string
  name: string
  position: { x: number; y: number }
  radius: number
  selected: boolean
}
