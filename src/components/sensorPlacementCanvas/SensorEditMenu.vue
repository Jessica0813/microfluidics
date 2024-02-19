<template>
  <div>
    <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
      <template v-slot:activator="{ props }">
        <button
          class="icon-button with-right-border"
          title="edit the sensor"
          :class="hasSensorSelected ? '' : 'disable-hover'"
          :disabled="!hasSensorSelected"
          v-bind="props"
        >
          <v-icon size="small" :color="hasSensorSelected ? '#66615b' : '#c2c2be'"
            >mdi-circle-edit-outline</v-icon
          >
        </button>
      </template>

      <div class="menu">
        <div class="pb-1">
          <CustomizedTextInput label="Name" v-model:text="sensorName" />
        </div>
        <div>
          <CustomizedNumberInput label="Radius" v-model:number="sensorRadius" />
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useSensorStore } from '@/stores/useSensorStore'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'

const { findSensor, editSensor } = useSensorStore()
const props = defineProps<{
  hasSensorSelected: boolean
  selectedSensorId: string
}>()

const menu = defineModel<boolean>('menu', { default: false })
const sensorName = ref('')
const sensorRadius = ref(0)

watch(
  () => props.selectedSensorId,
  (newVal) => {
    const sensor = findSensor(newVal)
    if (!sensor) {
      return
    }
    sensorName.value = sensor.name
    sensorRadius.value = sensor.radius
  }
)

watchEffect(() => {
  if (menu.value) {
    const currentName = sensorName.value
    const currentRadius = sensorRadius.value || 1

    const originalSensor = findSensor(props.selectedSensorId)

    if (
      originalSensor &&
      (originalSensor.name !== currentName || originalSensor.radius !== currentRadius)
    ) {
      // Changes detected, update the sensor using editSensor mutation
      editSensor(props.selectedSensorId, {
        name: currentName,
        radius: currentRadius
      })
    }
  }
})
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 16px;
  height: fit-content;
  width: 200px;
}
</style>
