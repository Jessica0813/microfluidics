import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sensor } from '@/types/sensor.ts'

export const useSensorStore = defineStore('sensor', () => {
  const sensors = ref<Sensor[]>([])

  const selectedSensor = ref<Sensor[]>([])

  let sensorId = 0

  function getSensorId() {
    return `sensor_${sensorId++}`
  }

  function addSensor(sensor: Sensor) {
    sensors.value.push(sensor)
  }

  function deleteSelectedSensor() {
    selectedSensor.value.forEach((sensor) => {
      const sensorIndex = sensors.value.findIndex((s) => s.id === sensor.id)
      if (sensorIndex !== -1) {
        sensors.value.splice(sensorIndex, 1)
      }
    })
    selectedSensor.value = []
  }

  function editSensor(id: string, updatedSensor: Partial<Sensor>) {
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)
    if (sensorIndex !== -1) {
      // If the sensor with the given id is found, update it
      Object.assign(sensors.value[sensorIndex], updatedSensor)
      console.log('1', sensors.value[sensorIndex])
    }
  }

  function findSensor(id: string) {
    return sensors.value.find((sensor) => sensor.id === id)
  }

  function onSelectSensor(id: string) {
    if (selectedSensor.value.length !== 0) {
      removeAllSelectedSensors()
    }
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)

    if (sensorIndex !== -1) {
      sensors.value[sensorIndex].selected = true
      selectedSensor.value.push(sensors.value[sensorIndex])
    }
  }

  function removeAllSelectedSensors() {
    // loop throught all the sensors in selectedSensor and set selected in the sesnor array to false
    selectedSensor.value.forEach((sensor) => {
      const sensorIndex = sensors.value.findIndex((s) => s.id === sensor.id)
      if (sensorIndex !== -1) {
        sensors.value[sensorIndex].selected = false
      }
    })
    selectedSensor.value = []
  }

  return {
    sensors,
    selectedSensor,
    getSensorId,
    addSensor,
    deleteSelectedSensor,
    editSensor,
    findSensor,
    onSelectSensor,
    removeAllSelectedSensors
  }
})
