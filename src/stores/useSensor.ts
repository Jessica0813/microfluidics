import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sensor } from '@/types/sensor.ts'

export const useSensorStore = defineStore('sensor', () => {
  const sensors = ref<Sensor[]>([
    {
      id: '1',
      type: 'temperature',
      name: 'Temperature Sensor',
      position: { x: 100, y: 100 },
      dimension: { width: 100, height: 100 }
    },
    {
      id: '2',
      type: 'speed',
      name: 'Speed Sensor',
      position: { x: 200, y: 200 },
      dimension: { width: 100, height: 100 }
    }
  ])

  function addSensor(sensor: Sensor) {
    sensors.value.push(sensor)
  }

  function removeSensor(id: string) {
    sensors.value = sensors.value.filter((sensor) => sensor.id !== id)
  }

  function editSensor(id: string, updatedSensor: Partial<Sensor>) {
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)

    if (sensorIndex !== -1) {
      // If the sensor with the given id is found, update it
      Object.assign(sensors.value[sensorIndex], updatedSensor)
    }
  }

  function findSensor(id: string) {
    return sensors.value.find((sensor) => sensor.id === id)
  }

  return { sensors, addSensor, removeSensor, editSensor, findSensor }
})
