<template>
  <div
    ref="sensorFloatingRef"
    class="wrapper sensor-edit-menu"
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
        <CustomizedDropdown v-model:selected="selectedSensor.type" :items="sensorType" />
      </v-menu>
      <v-menu :close-on-content-click="false" offset="10" v-model="isNameMenuOpen">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props" v-tippy="{ content: 'Name' }">
            <v-icon size="small" color="#66615b">mdi-rename-outline</v-icon>
          </button>
        </template>
        <CustomizedTextInput v-model:text="selectedSensor.name" />
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
import { useMenuPositionCalculatorForSensor } from '@/composables/useMenuPositionCalculator'
import { select } from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import { useSensorStore } from '@/stores/useSensorStore'
import type { Sensor } from '@/types/sensor'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { useSensorCanvasStore } from '@/stores/useSensorCanvasStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  designCanvasRef: HTMLElement | null
  transform: { x: number; y: number; k: number }
  isZooming: boolean
}>()

const { deleteSelectedSensor } = useSensorStore()
const { selectedSensors } = storeToRefs(useSensorStore())
const { addState } = useStateStore()
const { getZooming } = useSensorCanvasStore()

const sensorType = ['temperature', 'speed']

const isEditMenuOpen = ref(false)
const isNameMenuOpen = ref(false)
const sensorFloatingRef = ref<HTMLDivElement | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDraggable = ref(true)

let oldType = 'temperature'
let oldName = ''

const selectedSensor = ref<Sensor>({
  id: '',
  name: '',
  type: 'temperature',
  position: { x: 0, y: 0 },
  radius: 20,
  selected: false
})

function isSensorinView(target: HTMLElement) {
  if (props.designCanvasRef === null) {
    return false
  }

  const x = target.getBoundingClientRect()

  const targetLeft = x.left
  const targetTop = x.top
  const targetRight = x.right
  const targetBottom = x.bottom

  const { left, top, right, bottom } = props.designCanvasRef.getBoundingClientRect()
  return targetRight > left && targetBottom > top && targetLeft < right && targetTop < bottom
}

function showSensorEditMenu() {
  const target = document.getElementById(`sensor-${selectedSensor.value.id}`)

  if (!target) {
    return
  }

  if (selectedSensor.value.id !== '' && !isSensorinView(target)) {
    return
  }
  useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
    position.value = pos
  })
  isEditMenuOpen.value = true
}

watch(
  selectedSensors,
  (newValue, oldValue) => {
    if (newValue !== oldValue && newValue.length === 1) {
      selectedSensor.value = newValue[0]
      const target = document.getElementById(`sensor-${selectedSensor.value.id}`)
      useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
        position.value = pos
      })
      isEditMenuOpen.value = true
      oldType = selectedSensor.value.type
      oldName = selectedSensor.value.name
    } else if (newValue.length === 0 || newValue.length > 1) {
      selectedSensor.value = {
        id: '',
        name: '',
        type: 'temperature',
        position: { x: 0, y: 0 },
        radius: 20,
        selected: false
      }
      isEditMenuOpen.value = false
      oldType = 'temperature'
      oldName = ''
    }
  },
  { deep: true }
)

watch(
  () => props.isZooming,
  (newValue) => {
    if (selectedSensor.value.id !== '') {
      if (newValue) {
        isEditMenuOpen.value = false
      } else {
        showSensorEditMenu()
      }
    }
  }
)

watch(
  () => getZooming(),
  (newValue) => {
    if (selectedSensor.value.id !== '') {
      if (newValue) {
        isEditMenuOpen.value = false
      } else {
        showSensorEditMenu()
      }
    }
  }
)

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
  if (
    !newValue &&
    oldValue &&
    selectedSensor.value.id !== '' &&
    oldName !== selectedSensor.value.name
  ) {
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
  }
})

const d3Drag = drag<HTMLDivElement, any, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
let x: number = 0
let y: number = 0
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
</style>
