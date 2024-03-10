<template>
  <div class="bar">
    <v-menu :close-on-content-click="false" offset="8">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <div class="bg">
        <CustomizedNumberInput v-model:number="flowControl.duration" />
      </div>
    </v-menu>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-waves</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-location-enter</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-selection-ellipse-arrow-inside</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-car-brake-low-pressure</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FlowControl } from '@/types/flowControl'
import { ref } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'

const flowControl = ref<FlowControl>({
  inlet: 'inlet 1',
  injection: 'pump',
  fluid: 'water',
  pressure: 0,
  duration: 0,
  flowrate: 0
})
</script>

<style scoped>
.bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px;
  background-color: white;
  width: fit-content;
  height: fit-content;
  border-radius: 8px;
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
