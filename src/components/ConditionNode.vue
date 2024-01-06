<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const items = ['color sensor 1', 'viscosity sensor 2']

const sensorInput = ref()
const operatorInput = ref()
const valueInput = ref()

const dynamicOperators = computed(() => {
  // Get the selected sensor
  const selectedSensor = sensorInput.value

  if (selectedSensor === 'color sensor 1' || selectedSensor === undefined) {
    return ['=', '!=']
  } else if (selectedSensor === 'viscosity sensor 2') {
    return ['>', '<', '=', '!=', '>=', '<=']
  } else {
    return []
  }
})

watch(sensorInput, (newSensor, oldSensor) => {
  // Check if the sensorInput has changed
  if (newSensor !== oldSensor) {
    // Reset operatorInput and valueInput when the sensorInput changes
    operatorInput.value = null
    valueInput.value = null
  }
})
</script>

<template>
  <div>
    <Handle type="source" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
    <Handle type="source" :position="Position.Right" />
    <Handle type="source" :position="Position.Left" />
    <v-sheet
      class="pa-3 align-center justify-center"
      width="300"
      color="grey-lighten-4"
      :rounded="true"
    >
      <div class="d-flex align-center mb-3">
        <v-icon size="small" style="transform: rotate(180deg)" class="mr-2" color="grey-darken-3">
          mdi-call-split</v-icon
        >
        <p class="text-subtitle-2">Condition</p>
      </div>

      <v-row dense>
        <v-col cols="12">
          <v-select
            v-model="sensorInput"
            variant="outlined"
            density="compact"
            :items="items"
            color="blue-darken-3"
            label="sensor"
          >
          </v-select>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="operatorInput"
            variant="outlined"
            density="compact"
            :items="dynamicOperators"
            color="blue-darken-3"
            label="operators"
          >
          </v-select>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-if="sensorInput === undefined || sensorInput === 'color sensor 1'"
            v-model="valueInput"
            label="value"
            variant="outlined"
            density="compact"
            color="blue-darken-3"
          >
          </v-text-field>
          <v-text-field
            v-else-if="sensorInput === 'viscosity sensor 2'"
            v-model="valueInput"
            type="number"
            label="value"
            variant="outlined"
            density="compact"
            suffix="cp"
            color="blue-darken-3"
          >
          </v-text-field>
        </v-col>
      </v-row>
    </v-sheet>
  </div>
</template>
