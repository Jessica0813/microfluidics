<script setup lang="ts">
import type { Sensor } from '@/types/sensor'
import { useDrag } from '@/stores/useDrag'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { watch } from 'vue'
import type { Transform } from '@/types/sensor.ts'
import IconSensor from '../icons/IconSensor.vue'

const props = defineProps({
  sensor: {
    type: Object as () => Sensor,
    required: true
  },
  transform: {
    type: Object as () => Transform,
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

watch(
  () => props.transform,
  () => {
    if (!sensorRef.value) return
    // sensorRef.value.style.transform = `translate(${props.transform.x}px, ${props.transform.y}px), scale(${props.transform.k})`
    // console.log(props.transform)
  }
)
</script>

<template>
  <div
    ref="sensorRef"
    :id="sensor.id"
    :style="{
      position: 'absolute',
      left: props.transform.x + 'px',
      top: props.transform.y + 'px',
      width: sensor.dimension.width * props.transform.k + 'px',
      height: sensor.dimension.height * props.transform.k + 'px',
    }"
  >
  <IconSensor />
  </div>
</template>
