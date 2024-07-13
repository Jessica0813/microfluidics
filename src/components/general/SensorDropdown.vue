<template>
  <div class="dropdown-menu">
    <button
      class="dropdown-item"
      v-for="(item, index) in items"
      :style="{ color: selected === item ? '#007bff' : '' }"
      :key="index"
      @click="selectItem(item)"
      @mouseover="onHover(item)"
    >
      {{ item.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { type Sensor } from '@/types/sensor'
import { storeToRefs } from 'pinia'
import { useSensorStore } from '@/stores/useSensorStore'
import { useDesignCanvasStore } from '@/stores/useDesignCanvasStore'

defineProps<{
  items: Sensor[]
}>()

const selected = defineModel<Sensor | undefined>('selected', { default: undefined })

const { onSelectSensor, removeAllSelectedSensors } = useSensorStore()
const { d3Zoom, d3Selection, transform } = storeToRefs(useDesignCanvasStore())

function isSensorinView(sensor: Sensor) {
  const designCanvas = document.getElementById('design-canvas')
  const target = document.getElementById(`sensor-${sensor.id}`)
  if (!designCanvas || !target) return

  const x = target.getBoundingClientRect()

  const targetLeft = x.left
  const targetTop = x.top
  const targetRight = x.right
  const targetBottom = x.bottom

  const { left, top, right, bottom } = designCanvas.getBoundingClientRect()

  const isInView =
    targetRight > left && targetBottom > top && targetLeft < right && targetTop < bottom

  if (!isInView) {
    const deltaX =
      (targetLeft < left ? left - targetLeft : targetRight > right ? right - targetRight : 0) /
      transform.value.k

    const deltaY =
      (targetTop < top ? top - targetTop : targetBottom > bottom ? bottom - targetBottom : 0) /
      transform.value.k

    if (d3Zoom.value && d3Selection.value) {
      d3Zoom.value.translateBy(d3Selection.value, deltaX, deltaY)
    }
  }
}

function onHover(item: Sensor) {
  removeAllSelectedSensors()
  isSensorinView(item)
  onSelectSensor(item.id)
}

const selectItem = (item: Sensor) => {
  selected.value = item
}
</script>

<style scoped>
.dropdown-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 4px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  white-space: nowrap;
  margin-right: 8px;
}
.dropdown-item {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 2px;
}
.dropdown-item:hover {
  background-color: #eeeeee;
}

.dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 4px;
  background-color: white;
  border-radius: 4px;
  width: fit-content;
  border: 0.5px solid lightgray;
}
</style>
