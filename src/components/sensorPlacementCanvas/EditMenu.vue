<template>
  <div ref="senosrFloatingRef" class="wrapper" id="sensor-menu-bar">
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
import { ref, watch, computed } from 'vue'
import { useMenuPositionCalculatorForSensor } from '@/composables/useMenuPositionCalculator'
import { select } from 'd3'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import { useSensorStore } from '@/stores/useSensorStore'
import type { D3Zoom } from '@/types/d3'

const { findSensor, deleteSensorWithId } = useSensorStore()
const isEditMenuOpen = defineModel<boolean>('isEditMenuOpen', { default: false })

const sensorType = ['temperature', 'speed']
const props = defineProps<{
  selectedSensorId: string
  designCanvasRef: HTMLElement | null
  d3Zoom: D3Zoom | undefined
  transform: { x: number; y: number; k: number }
}>()
const isMenuOpen = ref(false)

const senosrFloatingRef = ref<HTMLElement | null>(null)
const position = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isDraggable = ref(true)

const selectedSensor = computed(() => {
  if (props.selectedSensorId) {
    const sensor = findSensor(props.selectedSensorId)
    if (sensor) {
      return sensor
    }
  }
  return {
    id: '',
    name: '',
    type: 'temperature',
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
    selected: false
  }
})

watch(
  () => selectedSensor.value,
  () => {
    if (selectedSensor.value) {
      const target = document.getElementById(`sensor-${selectedSensor.value.id}`)
      useMenuPositionCalculatorForSensor(target, senosrFloatingRef.value).then((pos) => {
        position.value = pos
      })
    }
  },
  {
    deep: true
  }
)

function deleteSelectedElements() {
  if (props.selectedSensorId) {
    deleteSensorWithId(props.selectedSensorId)
  }
}

function isSensorMenuinView(sensorX: number, sensorY: number, width: number, height: number) {
  const { x, y, k } = props.transform
  const screenX = (sensorX + x) * k
  const screenY = (sensorY + y) * k

  if (props.designCanvasRef === null) return
  const { left, top, right, bottom } = props.designCanvasRef.getBoundingClientRect()
  return screenX > left - width && screenY > top - height && screenX < right && screenY < bottom
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

// watch(
//   () => position.value,
//   () => {
//     if (floatingRef.value) {
//       select(floatingRef.value).call(d3Drag)
//     }
//   },
//   {
//     deep: true
//   }
// )
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
