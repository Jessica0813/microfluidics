<template>
  <div ref="sensorFloatingRef" class="wrapper" id="sensor-menu-bar" v-show="isEditMenuOpen">
    <div class="drag-button" @mouseenter="isDraggable = true" @mouseleave="isDraggable = false">
      <v-icon size="small" color="#66615b">mdi-drag</v-icon>
    </div>
    <div class="bar">
      <v-menu offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-leak</v-icon>
          </button>
        </template>
        <CustomizedDropdown v-model:selected="selectedSensor.type" :items="sensorType" />
      </v-menu>
      <v-menu :close-on-content-click="false" offset="10" v-model="isMenuOpen">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-rename-outline</v-icon>
          </button>
        </template>
        <CustomizedTextInput v-model:text="selectedSensor.name" />
      </v-menu>
      <button class="customized-button" @click="deleteSelectedElements">
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
import type { D3Zoom } from '@/types/d3'
import type { Sensor } from '@/types/sensor'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createState } from '@/composables/useStateCreation'

const { findSensor, deleteSensorWithId } = useSensorStore()
const { addState } = useStateStore()
const isEditMenuOpen = ref(false)

const sensorType = ['temperature', 'speed']
const props = defineProps<{
  selectedSensorId: string
  designCanvasRef: HTMLElement | null
  d3Zoom: D3Zoom | undefined
  transform: { x: number; y: number; k: number }
  isZooming: boolean
}>()
const isMenuOpen = ref(false)

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

watch(
  () => props.selectedSensorId,
  (newValue) => {
    if (newValue === '') {
      isEditMenuOpen.value = false
      selectedSensor.value = {
        id: '',
        name: '',
        type: 'temperature',
        position: { x: 0, y: 0 },
        radius: 20,
        selected: false
      }
      oldType = 'temperature'
      oldName = ''
    } else {
      const sensor = findSensor(newValue)
      if (sensor) {
        selectedSensor.value = sensor
        oldType = sensor.type
        oldName = sensor.name
        const target = document.getElementById(`sensor-${selectedSensor.value.id}`)
        useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
          position.value = pos
        })
        isEditMenuOpen.value = true
      }
    }
  }
)

watch(
  () => selectedSensor.value.position,
  () => {
    if (selectedSensor.value.id !== '') {
      const target = document.getElementById(`sensor-${selectedSensor.value.id}`)
      useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
        position.value = pos
      })
    }
  },
  {
    deep: true
  }
)

watch(
  () => props.isZooming,
  (newValue) => {
    if (selectedSensor.value.id !== '') {
      if (newValue) {
        isEditMenuOpen.value = false
      } else {
        isEditMenuOpen.value = true
        const target = document.getElementById(`sensor-${selectedSensor.value.id}`)
        useMenuPositionCalculatorForSensor(target, sensorFloatingRef.value).then((pos) => {
          position.value = pos
        })
      }
    }
  }
)

watch(
  () => selectedSensor.value.type,
  (newSelectedSensorType) => {
    if (selectedSensor.value.id !== '' && oldType !== newSelectedSensorType) {
      const state: StateController = {
        type: ActionType.UPDATE_SENSOR_TYPE,
        name: 'update sensor type ' + selectedSensor.value.id,
        objectId: selectedSensor.value.id,
        oldState: {
          objectType: oldType,
          data: ''
        },
        newState: {
          objectType: newSelectedSensorType,
          data: ''
        }
      }
      addState(state)
      oldType = newSelectedSensorType
    }
  }
)

watch(isMenuOpen, (newValue, oldValue) => {
  if (
    !newValue &&
    oldValue &&
    selectedSensor.value.id !== '' &&
    oldName !== selectedSensor.value.name
  ) {
    const state: StateController = {
      type: ActionType.UPDATE_SENSOR_NAME,
      name: 'update sensor name ' + selectedSensor.value.id,
      objectId: selectedSensor.value.id,
      oldState: {
        objectName: oldName,
        data: ''
      },
      newState: {
        objectName: selectedSensor.value.name,
        data: ''
      }
    }
    addState(state)
    oldType = selectedSensor.value.name
  }
})

function deleteSelectedElements() {
  if (props.selectedSensorId !== '') {
    const state: StateController = {
      type: ActionType.DELETE_SENSOR,
      name: 'delete sensor ' + selectedSensor.value.id,
      objectId: selectedSensor.value.id,
      oldState: {
        objectType: selectedSensor.value.type,
        objectName: selectedSensor.value.name,
        objectPosition: selectedSensor.value.position,
        objectRadius: selectedSensor.value.radius,
        data: ''
      }
    }
    deleteSensorWithId(props.selectedSensorId)
    addState(state)
  }
}

const d3Drag = drag<HTMLDivElement, any, any>()
let startOffsetX: number = 0
let startOffsetY: number = 0
let x: number = 0
let y: number = 0
d3Drag.on('start', (event: D3DragEvent<HTMLDivElement, any, any>) => {
  event.sourceEvent.preventDefault()
  console.log(event)
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
    deep: true
  }
)
</script>

<style scoped>
.wrapper {
  position: fixed;
  z-index: 3;
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
.bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
}
.customized-button {
  display: flex;
  padding: 4px;
  justify-content: center;
  align-items: center;
  margin-right: 2px;
}
.customized-button:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.bg {
  background-color: white;
  padding: 8px;
}
</style>
