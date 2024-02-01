import type { Sensor } from '@/types/sensor'

interface Transform {
  x: number
  y: number
  k: number
}

export function useDrop(event: any, transform: Transform, sensorId: string, addSensor: Function) {
  const type = event.dataTransfer?.getData('application/desgin')
  const position = {
    x: (event.clientX - transform.x) / transform.k,
    y: (event.clientY - transform.y) / transform.k
  }
  const newSensor: Sensor = {
    id: sensorId,
    type,
    position,
    name: sensorId,
    radius: 20,
    selected: false
  }
  addSensor(newSensor)
}
