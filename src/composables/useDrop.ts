import type { Sensor } from '@/types/sensor'

interface Transform {
  x: number
  y: number
  k: number
}

export function useDrop(
  left: number,
  top: number,
  event: any,
  transform: Transform,
  sensorId: string,
  addSensor: Function,
  setSensorName: Function
) {
  const type = event.dataTransfer?.getData('application/desgin')
  const position = {
    x: (event.clientX - left - transform.x) / transform.k,
    y: (event.clientY - top - transform.y) / transform.k
  }
  const sensorName = setSensorName(sensorId, type)
  const newSensor: Sensor = {
    id: sensorId,
    type,
    position,
    name: sensorName,
    radius: 15,
    selected: false
  }
  addSensor(newSensor)
}
