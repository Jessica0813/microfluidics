import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sensor } from '@/types/sensor.ts'
import { useStateStore } from './useStateStore'
import { type StateController, ActionType } from '@/types/stateController'

export const useSensorStore = defineStore('sensor', () => {
  const { addState } = useStateStore()

  const tolerance = 0.00001

  const sensors = ref<Sensor[]>([])

  const selectedSensor = ref<Sensor[]>([])

  const shouldRecordState = ref(true)

  let sensorId = 0

  function getSensorId() {
    return `sensor_${sensorId++}`
  }

  function toggleRecordState() {
    shouldRecordState.value = !shouldRecordState.value
  }

  function addSensor(sensor: Sensor) {
    sensors.value.push(sensor)

    if (!shouldRecordState.value) {
      return
    }

    const state: StateController = {
      type: ActionType.CREATE_SENSOR,
      name: 'create sensor ' + sensor.id,
      objectId: sensor.id,
      objectPosition: sensor.position,
      objectType: sensor.type,
      objectRadius: sensor.radius,
      data: ''
    }
    addState(state)
  }

  function deleteSelectedSensor() {
    selectedSensor.value.forEach((sensor) => {
      const sensorIndex = sensors.value.findIndex((s) => s.id === sensor.id)
      if (sensorIndex !== -1) {
        const state: StateController = {
          type: ActionType.DELETE_SENSOR,
          name: 'delete sensor ' + sensor.name,
          objectId: sensor.id,
          objectPosition: sensor.position,
          objectType: sensor.type,
          objectRadius: sensor.radius,
          data: ''
        }
        addState(state)
        sensors.value.splice(sensorIndex, 1)
      }
    })
    selectedSensor.value = []
  }

  function deleteSensorWithId(id: string) {
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)
    if (sensorIndex !== -1) {
      sensors.value.splice(sensorIndex, 1)
    }
  }

  function editSensor(id: string, updatedSensor: Partial<Sensor>) {
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)
    if (sensorIndex !== -1) {
      const sensor = sensors.value[sensorIndex]
      if (shouldRecordState.value) {
        if (
          updatedSensor.position !== undefined &&
          updatedSensor.radius !== undefined &&
          Math.abs(updatedSensor.position.x - sensor.position.x) >= tolerance &&
          Math.abs(updatedSensor.position.y - sensor.position.y) >= tolerance &&
          Math.abs(updatedSensor.radius - sensor.radius) >= tolerance
        ) {
          const state: StateController = {
            type: ActionType.RESIZE_SENSOR,
            name: 'resize sensor ' + sensor.name,
            objectId: sensor.id,
            objectPosition: sensor.position,
            objectType: sensor.type,
            objectRadius: sensor.radius,
            data: ''
          }
          addState(state)
        } else if (
          updatedSensor.position !== undefined &&
          Math.abs(updatedSensor.position.x - sensor.position.x) >= tolerance &&
          Math.abs(updatedSensor.position.y - sensor.position.y) >= tolerance
        ) {
          const state: StateController = {
            type: ActionType.MOVE_SENSOR,
            name: 'move sensor ' + sensor.name,
            objectId: sensor.id,
            objectPosition: sensor.position,
            objectType: sensor.type,
            objectRadius: sensor.radius,
            data: ''
          }
          addState(state)
        }
      }

      // If the sensor with the given id is found, update it
      Object.assign(sensors.value[sensorIndex], updatedSensor)
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
    deleteSensorWithId,
    editSensor,
    findSensor,
    onSelectSensor,
    removeAllSelectedSensors,
    toggleRecordState
  }
})
