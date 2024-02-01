import type { Sensor } from '@/types/sensor'

interface Transform {
  x: number
  y: number
  k: number
}

export function useDrop(event: any, transform: Transform, sensorId: string, addSensor: Function) {
  const type = event.dataTransfer?.getData('application/desgin')
  const position = {
    x: (event.clientX - 7.5 - transform.x) / transform.k,
    y: (event.clientY - 15 - transform.y) / transform.k
  }
  const newSensor: Sensor = {
    id: sensorId,
    type,
    position,
    name: sensorId,
    dimension: {
      width: 15,
      height: 30
    },
    selected: false
  }
  addSensor(newSensor)
}
