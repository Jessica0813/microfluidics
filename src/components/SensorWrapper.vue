<script setup lang="ts">
import type { Sensor } from '@/types/sensor'
import { useDrag } from '@/stores/useDrag'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { watch } from 'vue'

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true
  }
})

const sensorRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!sensorRef.value) return
  useDrag({
    el: sensorRef,
    id: props.sensor.id
  })
})

//not sure if it's a good solution
watch(
  () => props.sensor.position,
  () => {
    if (!sensorRef.value) return
    useDrag({
      el: sensorRef,
      id: props.sensor.id
    })
  }
)
</script>

<template>
  <div
    ref="sensorRef"
    :id="sensor.id"
    draggable="true"
    :style="{
      width: `${sensor.dimension.width}px`,
      height: `${sensor.dimension.height}px`,
      left: `${sensor.position.x}px`,
      top: `${sensor.position.y}px`,
      backgroundColor: 'grey',
      position: 'absolute'
    }"
  ></div>
</template>
