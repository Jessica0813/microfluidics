import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sensor } from '@/types/sensor.ts'
import { useStateStore } from './useStateStore'
import { type StateController, ActionType } from '@/types/stateController'

export const useSensorStore = defineStore('sensor', () => {
  const { addState } = useStateStore()

  const tolerance = 0.0001

  const sensors = ref<Sensor[]>([])

  const selectedSensor = ref<Sensor[]>([])

  const shouldRecordState = ref(true)

  const isMetaKeyPressed = ref(false)

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
      oldState: {
        objectPosition: sensor.position,
        objectType: sensor.type,
        objectRadius: sensor.radius,
        data: ''
      }
    }
    addState(state)
  }

  function deleteSelectedSensor() {
    if (selectedSensor.value.length === 1) {
      const sensorIndex = sensors.value.findIndex(
        (sensor) => sensor.id === selectedSensor.value[0].id
      )
      const sensor = selectedSensor.value[0]
      if (sensorIndex !== -1) {
        const state: StateController = {
          type: ActionType.DELETE_SENSOR,
          name: 'delete sensor ' + sensor.name,
          objectId: sensor.id,
          oldState: {
            objectPosition: sensor.position,
            objectType: sensor.type,
            objectRadius: sensor.radius,
            data: ''
          }
        }
        addState(state)
        sensors.value.splice(sensorIndex, 1)
      }
    } else if (selectedSensor.value.length > 1) {
      const state: StateController = {
        type: ActionType.DELETE_MULTI_SENSORS,
        name: 'delete multiple sensors',
        objectId: [],
        oldState: [],
        newState: []
      }
      selectedSensor.value.forEach((sensor) => {
        const sensorIndex = sensors.value.findIndex((s) => s.id === sensor.id)
        if (sensorIndex !== -1 && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
          state.objectId.push(sensor.id)
          state.oldState.push({
            objectPosition: sensor.position,
            objectType: sensor.type,
            objectRadius: sensor.radius,
            data: ''
          })
          sensors.value.splice(sensorIndex, 1)
        }
      })
      if (state.objectId.length > 0) {
        addState(state)
      }
    }
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
        addSensorChangeState(updatedSensor, sensor, tolerance, addState)
      }
      Object.assign(sensors.value[sensorIndex], updatedSensor)
    }
  }

  function editMultiSensors(id: string[], updatedSensors: Partial<Sensor>[]) {
    const sensorsWitholdData = sensors.value.filter((sensor) => id.includes(sensor.id))
    if (shouldRecordState.value) {
      addMultiSensorsChangeState(id, updatedSensors, sensorsWitholdData, tolerance, addState)
    }
    for (let i = 0; i < id.length; i++) {
      const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id[i])
      if (sensorIndex !== -1) {
        Object.assign(sensors.value[sensorIndex], updatedSensors[i])
      }
    }
  }

  function findSensor(id: string) {
    return sensors.value.find((sensor) => sensor.id === id)
  }

  function onSelectSensor(id: string) {
    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey) {
        isMetaKeyPressed.value = true
      }
    })
    if (!isMetaKeyPressed.value) {
      removeAllSelectedSensors()
    }
    const sensorIndex = sensors.value.findIndex((sensor) => sensor.id === id)

    if (sensorIndex !== -1) {
      sensors.value[sensorIndex].selected = true
      selectedSensor.value.push(sensors.value[sensorIndex])
    }

    if (isMetaKeyPressed.value) {
      isMetaKeyPressed.value = false
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

  function getSelectedSensors() {
    return selectedSensor.value
  }

  return {
    sensors,
    selectedSensor,
    toggleRecordState,
    getSensorId,
    addSensor,
    deleteSelectedSensor,
    deleteSensorWithId,
    editSensor,
    findSensor,
    onSelectSensor,
    removeAllSelectedSensors,
    getSelectedSensors,
    editMultiSensors
  }
})

function addSensorChangeState(
  updatedSensor: Partial<Sensor>,
  sensor: Sensor,
  tolerance: number,
  addState: (state: StateController) => void
) {
  if (
    updatedSensor.position !== undefined &&
    updatedSensor.radius !== undefined &&
    (Math.abs(updatedSensor.position.x - sensor.position.x) >= tolerance ||
      Math.abs(updatedSensor.position.y - sensor.position.y) >= tolerance ||
      Math.abs(updatedSensor.radius - sensor.radius) >= tolerance)
  ) {
    const state: StateController = {
      type: ActionType.RESIZE_SENSOR,
      name: 'resize sensor ' + sensor.name,
      objectId: sensor.id,
      oldState: {
        objectPosition: sensor.position,
        objectType: sensor.type,
        objectRadius: sensor.radius,
        data: ''
      },
      newState: {
        objectPosition: updatedSensor.position,
        objectType: sensor.type,
        objectRadius: updatedSensor.radius,
        data: ''
      }
    }
    addState(state)
  } else if (
    updatedSensor.position !== undefined &&
    (Math.abs(updatedSensor.position.x - sensor.position.x) >= tolerance ||
      Math.abs(updatedSensor.position.y - sensor.position.y) >= tolerance)
  ) {
    const state: StateController = {
      type: ActionType.MOVE_SENSOR,
      name: 'move sensor ' + sensor.name,
      objectId: sensor.id,
      oldState: {
        objectPosition: sensor.position,
        objectType: sensor.type,
        objectRadius: sensor.radius,
        data: ''
      },
      newState: {
        objectPosition: updatedSensor.position,
        objectType: sensor.type,
        objectRadius: sensor.radius,
        data: ''
      }
    }
    addState(state)
  }
}

function addMultiSensorsChangeState(
  id: string[],
  updatedSensor: Partial<Sensor>[],
  sensors: Sensor[],
  tolerance: number,
  addState: (state: StateController) => void
) {
  if (updatedSensor[0].radius !== undefined) {
    const state: StateController = {
      type: ActionType.Resize_MUlTI_SENSORS,
      name: 'resize multiple sensors',
      objectId: [],
      oldState: [],
      newState: []
    }

    for (let i = 0; i < id.length; i++) {
      if (
        updatedSensor[i].position !== undefined &&
        updatedSensor[i].radius !== undefined &&
        (Math.abs(updatedSensor[i].position!.x - sensors[i].position.x) >= tolerance ||
          Math.abs(updatedSensor[i].position!.y - sensors[i].position.y) >= tolerance ||
          Math.abs(updatedSensor[i].radius! - sensors[i].radius) >= tolerance) &&
        Array.isArray(state.objectId) &&
        Array.isArray(state.oldState) &&
        Array.isArray(state.newState)
      ) {
        state.objectId.push(id[i])
        state.oldState.push({
          objectPosition: sensors[i].position,
          objectType: sensors[i].type,
          objectRadius: sensors[i].radius,
          data: ''
        })
        state.newState.push({
          objectPosition: updatedSensor[i].position!,
          objectType: sensors[i].type,
          objectRadius: updatedSensor[i].radius!,
          data: ''
        })
      }
    }
    if (state.objectId.length > 0) {
      addState(state)
    }
  } else {
    const state: StateController = {
      type: ActionType.MOVE_MULTI_SENSORS,
      name: 'move multiple sensors',
      objectId: [],
      oldState: [],
      newState: []
    }
    for (let i = 0; i < id.length; i++) {
      const x = updatedSensor[i].position?.x || 0
      const y = updatedSensor[i].position?.y || 0
      if (
        (Math.abs(x - sensors[i].position.x) >= tolerance ||
          Math.abs(y - sensors[i].position.y) >= tolerance) &&
        Array.isArray(state.objectId) &&
        Array.isArray(state.oldState) &&
        Array.isArray(state.newState)
      ) {
        state.objectId.push(id[i])
        state.oldState.push({
          objectPosition: sensors[i].position,
          objectType: sensors[i].type,
          objectRadius: sensors[i].radius,
          data: ''
        })
        state.newState.push({
          objectPosition: updatedSensor[i].position!,
          objectType: sensors[i].type,
          objectRadius: sensors[i].radius,
          data: ''
        })
      }
    }
    if (state.objectId.length > 0) {
      addState(state)
    }
  }
}
