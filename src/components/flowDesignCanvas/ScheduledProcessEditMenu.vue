<template>
  <div class="bar" v-if="!selected">
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
  </div>
  <div class="bar" v-else>
    <v-menu offset="10">
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
    </button>
  </div>
</template>

<script setup lang="ts">
// import type { FlowControl } from '@/types/flowControl'
import { ref, computed, watch, onMounted } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import { useVueFlow } from '@vue-flow/core'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import type { ScheduledFlowControl } from '@/types/flowControl'

const { findNode } = useVueFlow()

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
const fluids = ['water', 'oil']
const selected = ref(false)
const flowControl = ref({
  id: '-1',
  name: 'xyz',
  selected: false,
  startTime: 0.0,
  endTime: 1.0,
  duration: 1.0,
  inlet: 'Inlet 1',
  injection: 'pump',
  fluid: 'water',
  pressure: 0,
  flowrate: 0
})

const props = defineProps<{
  id: string | null
}>()

const scheduledFlowControl = ref<ScheduledFlowControl>({
  totalDuration: 20,
  name: 'a',
  processes: []
})

onMounted(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.scheduledFlowControl === undefined) {
    return
  }
  scheduledFlowControl.value = data.scheduledFlowControl
})

watch(
  () => scheduledFlowControl.value.processes,
  () => {
    console.log('watching')
    let i
    for (i = 0; i < scheduledFlowControl.value.processes.length; i++) {
      if (scheduledFlowControl.value.processes[i].selected) {
        flowControl.value = scheduledFlowControl.value.processes[i]
        selected.value = true
        break
      }
    }
    if (i === scheduledFlowControl.value.processes.length) {
      selected.value = false
      flowControl.value = {
        id: '-1',
        name: 'xyz',
        selected: false,
        startTime: 0.0,
        endTime: 1.0,
        duration: 1.0,
        inlet: 'Inlet 1',
        injection: 'pump',
        fluid: 'water',
        pressure: 0,
        flowrate: 0
      }
    }
  },
  {
    deep: true
  }
)
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
