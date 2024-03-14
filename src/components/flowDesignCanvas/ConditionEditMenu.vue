<template>
  <div class="bar">
    <v-menu offset="10">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-leak</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="condition.sensor" :items="sensors" />
    </v-menu>
    <v-menu offset="10">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-compare-horizontal</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="condition.operator" :items="dynamicOperators" />
    </v-menu>
    <!-- <v-menu
      :close-on-content-click="false"
      offset="10"
      v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-palette</v-icon>
        </button>
      </template>
      <CustomizedColorInput v-model:color="condition.color" />
    </v-menu> -->
    <CustomizedColorInput
      v-model:color="condition.color"
      v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
    />
    <v-menu
      :close-on-content-click="false"
      offset="10"
      v-else-if="condition.sensor === 'viscosity sensor'"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-numeric</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="condition.viscosity" />
    </v-menu>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import CustomizedColorInput from '../general/CustomizedColorInput.vue'
import { useVueFlow } from '@vue-flow/core'

const { findNode } = useVueFlow()

const props = defineProps<{
  id: string | null
}>()

const condition = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.condition === undefined) {
    return {
      name: 'xxx',
      sensor: 'color sensor',
      operator: '=',
      color: '#FFFFFF',
      viscosity: 0
    }
  }
  return data.condition
})

const sensors = ['color sensor', 'viscosity sensor']

const dynamicOperators = computed(() => {
  // Get the selected sensor
  const selectedSensor = condition.value.sensor

  if (selectedSensor === 'color sensor' || selectedSensor === undefined) {
    return ['=', '!=']
  } else if (selectedSensor === 'viscosity sensor') {
    return ['>', '<', '=', '!=', '>=', '<=']
  } else {
    return []
  }
})
</script>

<style scoped>
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
  padding: 6px;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
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
