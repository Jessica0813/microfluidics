<template>
  <div
    ref="sensorFloatingRef"
    class="wrapper sensor-edit-menu fade-appearance"
    id="sensor-menu-bar"
    v-show="isEditMenuOpen"
  >
    <div
      class="drag-button"
      @mouseenter="isDraggable = true"
      @mouseleave="isDraggable = false"
      v-tippy="{ content: 'Drag' }"
    >
      <v-icon size="small" color="#66615b">mdi-drag</v-icon>
    </div>
    <div class="bar">
      <v-menu offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props" v-tippy="{ content: 'Sensor' }">
            <v-icon size="small" color="#66615b">mdi-leak</v-icon>
          </button>
        </template>
        <CustomizedDropdown v-model:selected="selectedSensor.type" :items="sensorTypes" />
      </v-menu>
      <v-menu :close-on-content-click="false" offset="10" v-model="isNameMenuOpen">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props" v-tippy="{ content: 'Name' }">
            <v-icon size="small" color="#66615b">mdi-rename-outline</v-icon>
          </button>
        </template>
        <InputWithValidation
          v-model:text="selectedSensor.name"
          :is-valid="isNameValid"
          @input="handleInput"
        />
      </v-menu>
      <button
        class="customized-button"
        @click="deleteSelectedSensor"
        v-tippy="{ content: 'Delete' }"
      >
        <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { select } from 'd3'
import { drag, type D3DragEvent } from 'd3-drag'

import { type Sensor, SensorType } from '@/types/sensor'
import { type StateController, ActionType } from '@/types/stateController'

import { useMenuPositionCalculatorForSensor } from '@/composables/useMenuPositionCalculator'
import { useElementInView } from '@/composables/useElementInView'

import { useSensorStore } from '@/stores/useSensorStore'
import { useStateStore } from '@/stores/useStateStore'
import { useDesignCanvasStore } from '@/stores/useDesignCanvasStore'

import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import InputWithValidation from '../general/InputWithValidation.vue'

const props = defineProps<{
  designCanvasRef: HTMLElement | null
}>()

const sensorFloatingRef = ref<HTMLDivElement | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isEditMenuOpen = ref(false)
const isNameMenuOpen = ref(false)
const isDraggable = ref(true)
const isNameValid = ref(true)
const selectedSensor = ref<Sensor>({
  id: '',
  name: '',
  type: SensorType.Temperature,
  position: { x: 0, y: 0 },
  radius: 20,
  selected: false
})

const sensorTypes = [SensorType.Temperature, SensorType.Speed, SensorType.Color]
let oldType: SensorType = SensorType.Temperature
let oldName = ''
const d3Drag = drag<HTMLDivElement, any, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
let x: number = 0
let y: number = 0

const { deleteSelectedSensor, checkIfSensorNameExists } = useSensorStore()
const { selectedSensors } = storeToRefs(useSensorStore())
const { addState } = useStateStore()
const { isZoomingOrDragging } = storeToRefs(useDesignCanvasStore())

function handleInput(value: string) {
  if (value === '') {
    isNameValid.value = false
    return
  }
  isNameValid.value = !checkIfSensorNameExists(selectedSensor.value.id, value)
}

function showSensorEditMenu() {
  const target = document.getElementById(`${selectedSensor.value.id}`)

  if (!target) {
    console.error('target not found')
    return
  }

  if (selectedSensor.value.id !== '' && !useElementInView(props.designCanvasRef, target)) {
    console.error('target not in view')
    return
  }
  useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
    position.value = pos
  })
  isEditMenuOpen.value = true
}

watch([selectedSensors, isZoomingOrDragging], ([newSelectedSensors, newIsZoomingOrDragging]) => {
  if (newIsZoomingOrDragging) {
    isEditMenuOpen.value = false
    return
  }

  if (newSelectedSensors.length === 1) {
    selectedSensor.value = newSelectedSensors[0]
    showSensorEditMenu()
    oldType = selectedSensor.value.type
    oldName = selectedSensor.value.name
  } else if (newSelectedSensors.length === 0 || newSelectedSensors.length > 1) {
    selectedSensor.value = {
      id: '',
      name: '',
      type: SensorType.Temperature,
      position: { x: 0, y: 0 },
      radius: 20,
      selected: false
    }
    isEditMenuOpen.value = false
    oldType = SensorType.Temperature
    oldName = ''
  }
})

watch(isEditMenuOpen, (newValue) => {
  if (!newValue) {
    isNameMenuOpen.value = false
  }
})

watch(
  () => selectedSensor.value.type,
  (newSelectedSensorType) => {
    if (selectedSensor.value.id !== '' && oldType !== newSelectedSensorType) {
      const newType = newSelectedSensorType
      const state: StateController = {
        type: ActionType.UPDATE_SENSOR_TYPE,
        name: 'update sensor type ' + selectedSensor.value.id,
        objectId: selectedSensor.value.id,
        oldState: {
          objectType: oldType,
          data: ''
        },
        newState: {
          objectType: newType,
          data: ''
        }
      }
      addState(state)
      oldType = newType
    }
  }
)

watch(isNameMenuOpen, (newValue, oldValue) => {
  if (!newValue && oldValue && !isNameValid.value) {
    selectedSensor.value.name = oldName
    isNameValid.value = true
  }
  if (!newValue && oldValue && oldName !== selectedSensor.value.name) {
    const newName = selectedSensor.value.name
    const state: StateController = {
      type: ActionType.UPDATE_SENSOR_NAME,
      name: 'update sensor name ' + selectedSensor.value.id,
      objectId: selectedSensor.value.id,
      oldState: {
        objectName: oldName,
        data: ''
      },
      newState: {
        objectName: newName,
        data: ''
      }
    }
    addState(state)
    oldName = newName
    isNameValid.value = true
  }
})

d3Drag.on('start', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  startOffsetX = event.x - position.value.x
  startOffsetY = event.y - position.value.y
})
d3Drag.on('drag', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  x = event.x - startOffsetX
  y = event.y - startOffsetY
  select('#sensor-menu-bar').style('top', `${y}px`).style('left', `${x}px`)
})
d3Drag.on('end', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  position.value.x = x
  position.value.y = y
})
d3Drag.filter(() => isDraggable.value)

watch(
  () => position.value,
  () => {
    if (sensorFloatingRef.value) {
      select(sensorFloatingRef.value).call(d3Drag)
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style scoped>
.wrapper {
  position: fixed;
  z-index: 10;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px;
  background-color: white;
  width: fit-content;
  height: fit-content;
  border-radius: 8px;
  box-shadow: 2px 2px 4px 0px rgba(128, 128, 128, 0.2);
}
.drag-button {
  display: flex;
  padding: 4px;
  justify-content: center;
  align-items: center;
  margin-right: 2px;
  margin-left: 2px;
  background-color: white;
  cursor: all-scroll;
}

.fade-appearance {
  animation: fadeIn 0.5s ease;
}
</style>
