<script setup lang="ts">
import { computed, watch } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'

defineProps({
  id: String
})

const items = ['color sensor', 'viscosity sensor']
const name = defineModel<string>('name', { default: '' })
const sensor = defineModel<string>('sensor', { default: '' })
const operator = defineModel<string>('operator', { default: '' })
const viscosity = defineModel('viscosity', { default: 0 })
const color = defineModel<string>('color', { default: '' })

const dynamicOperators = computed(() => {
  // Get the selected sensor
  const selectedSensor = sensor.value

  if (selectedSensor === 'color sensor' || selectedSensor === undefined) {
    return ['=', '!=']
  } else if (selectedSensor === 'viscosity sensor') {
    return ['>', '<', '=', '!=', '>=', '<=']
  } else {
    return []
  }
})

watch(sensor, (newSensor, oldSensor) => {
  // Check if the sensorInput has changed
  if (newSensor !== oldSensor) {
    // Reset operatorInput and valueInput when the sensorInput changes
    operator.value = '='
    viscosity.value = 0
    color.value = '#FFFFFF'
  }
})
</script>

<template>
  <v-sheet class="pa-3 align-center justify-center" width="300" :rounded="true">
    <v-row dense>
      <v-col cols="6">
        <CustomizedTextInput v-model:text="name" label="Name" />
      </v-col>
      <v-col cols="6">
        <CustomizedDropdown v-model:selected="sensor" :items="items" label="Sensor" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <CustomizedDropdown
          v-model:selected="operator"
          :items="dynamicOperators"
          label="Operator"
        />
      </v-col>
      <v-col cols="6">
        <CustomizedTextInput
          v-if="sensor === '' || sensor === 'color sensor'"
          v-model="color"
          label="Value"
        />
        <CustomizedNumberInput
          v-else-if="sensor === 'viscosity sensor'"
          v-model:number="viscosity"
          label="Value"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>
