export enum SensorType {
  Temperature = 'temperature',
  Speed = 'speed',
  Color = 'color'
}

export interface Sensor {
  id: string
  type: SensorType
  name: string
  position: { x: number; y: number }
  radius: number
  selected: boolean
}
