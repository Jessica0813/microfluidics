<script setup lang="ts">
import { computed, watch } from 'vue'

defineProps({
  id: String
})

const items = ['color sensor', 'viscosity sensor']
const menu = defineModel<boolean>('menu', { default: false })
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
  <v-menu v-model="menu" :close-on-content-click="false" location="end">
    <template v-slot:activator="{ props }">
      <v-icon size="small" color="grey-darken-3" v-bind="props"> mdi-dots-vertical</v-icon>
    </template>
    <v-sheet
      class="pa-3 align-center justify-center"
      width="300"
      color="grey-lighten-4"
      :rounded="true"
    >
      <div class="d-flex align-center justify-center mb-4">
        <p class="text-subtitle-1">Coniditon</p>
      </div>

      <v-row dense>
        <v-col cols="12">
          <v-select
            v-model="sensor"
            variant="outlined"
            density="compact"
            :items="items"
            color="blue-darken-3"
            label="sensor"
            :hide-details="true"
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="operator"
            variant="outlined"
            density="compact"
            :items="dynamicOperators"
            color="blue-darken-3"
            label="operators"
            :hide-details="true"
          >
          </v-select>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-if="sensor === '' || sensor === 'color sensor'"
            v-model="color"
            label="value"
            variant="outlined"
            density="compact"
            color="blue-darken-3"
            :hide-details="true"
          >
          </v-text-field>
          <v-text-field
            v-else-if="sensor === 'viscosity sensor'"
            v-model="viscosity"
            type="number"
            label="value"
            variant="outlined"
            density="compact"
            suffix="cp"
            color="blue-darken-3"
            :hide-details="true"
          >
          </v-text-field>
        </v-col>
      </v-row>
    </v-sheet>
  </v-menu>
</template>
