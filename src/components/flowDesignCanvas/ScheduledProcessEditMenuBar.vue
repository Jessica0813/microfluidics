<template>
  <div class="bar">
    <v-menu :close-on-content-click="false" offset="10">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="scheduledFlowControl.totalDuration" />
    </v-menu>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
    <!-- <v-menu offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-waves</v-icon>
          </button>
        </template>
        <CustomizedDropdown v-model:selected="flowControl.fluid" :items="fluids" />
      </v-menu>
      <v-menu offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-location-enter</v-icon>
          </button>
        </template>
        <CustomizedDropdown v-model:selected="flowControl.inlet" :items="inlets" />
      </v-menu>
      <v-menu offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-selection-ellipse-arrow-inside</v-icon>
          </button>
        </template>
        <CustomizedDropdown v-model:selected="flowControl.injection" :items="injections" />
      </v-menu>
      <v-menu
        :close-on-content-click="false"
        offset="10"
        v-if="flowControl.injection === '' || flowControl.injection === 'pump'"
      >
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-car-brake-low-pressure</v-icon>
          </button>
        </template>
        <CustomizedNumberInput v-model:number="flowControl.pressure" />
      </v-menu>
      <v-menu
        :close-on-content-click="false"
        offset="10"
        v-else-if="flowControl.injection === 'needle'"
      >
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
          </button>
        </template>
        <CustomizedNumberInput v-model:number="flowControl.flowrate" />
      </v-menu>
      <v-menu :close-on-content-click="false" offset="10">
        <template v-slot:activator="{ props }">
          <button class="customized-button" v-bind="props">
            <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
          </button>
        </template>
        <CustomizedNumberInput v-model:number="flowControl.duration" />
      </v-menu>
      <button class="customized-button">
        <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
      </button> -->
  </div>
</template>

<script setup lang="ts">
// import type { FlowControl } from '@/types/flowControl'
import { ref } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import type { ScheduledFlowControl } from '@/types/flowControl'
// import CustomizedDropdown from '../general/CustomizedDropdown.vue'

// const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
// const injections = ['pump', 'needle']
// const fluids = ['water', 'oil']

const scheduledFlowControl = ref<ScheduledFlowControl>({
  totalDuration: 20,
  name: 'a',
  processes: []
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
