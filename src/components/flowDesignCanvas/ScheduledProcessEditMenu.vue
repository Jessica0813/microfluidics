<template>
  <div class="bar" v-if="!isChildProcessSelected">
    <v-menu :close-on-content-click="false" offset="10" v-model="isTotalDurationMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="scheduledFlowControl.totalDuration" />
    </v-menu>
    <button class="customized-button" @click="deleteSelectedElements">
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
      v-model="isPressureMenuOpen"
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
      v-model="isFlowrateMenuOpen"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.flowrate" />
    </v-menu>
    <v-menu :close-on-content-click="false" offset="10" v-model="isSubProcessDurationMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.duration" />
    </v-menu>
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import { useVueFlow } from '@vue-flow/core'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createState } from '@/composables/useStateCreation'
import type { FlowControlProcess } from '@/types/flowControl'

const { findNode, removeNodes } = useVueFlow()
const { addState } = useStateStore()

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
const fluids = ['water', 'oil']
const isChildProcessSelected = ref(false)
const flowControl = defineModel<FlowControlProcess>('editedFlowControl', {
  default: {
    id: '-1',
    name: 'xyz',
    selected: false,
    startTime: 0.0,
    endTime: 1.0,
    duration: 1.0,
    inlet: 'inlet 1',
    injection: 'pump',
    fluid: 'water',
    pressure: 0,
    flowrate: 0
  }
})

const isTotalDurationMenuOpen = ref(false)
const isPressureMenuOpen = ref(false)
const isFlowrateMenuOpen = ref(false)
// const isStartTimeMenuOpen = ref(false)
const isSubProcessDurationMenuOpen = ref(false)

const isMenuOpen = computed(() => {
  return (
    isPressureMenuOpen.value ||
    isFlowrateMenuOpen.value ||
    isSubProcessDurationMenuOpen.value ||
    isTotalDurationMenuOpen.value
  )
})

const props = defineProps<{
  id: string | null
}>()

const scheduledFlowControl = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.scheduledFlowControl === undefined) {
    return {
      totalDuration: 20,
      name: 'a',
      processes: []
    }
  }
  return data.scheduledFlowControl
})

watch(
  () => scheduledFlowControl.value.processes,
  () => {
    let i
    for (i = 0; i < scheduledFlowControl.value.processes.length; i++) {
      if (scheduledFlowControl.value.processes[i].selected) {
        flowControl.value = scheduledFlowControl.value.processes[i]
        isChildProcessSelected.value = true
        break
      }
    }
    if (i === scheduledFlowControl.value.processes.length) {
      isChildProcessSelected.value = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

let oldScheduledFlowControl = Object.assign({}, scheduledFlowControl.value)
let oldFlowControl = Object.assign({}, flowControl.value)

watch(
  scheduledFlowControl.value,
  (newscheduledFlowControl) => {
    if (newscheduledFlowControl && !isMenuOpen.value) {
      const node = findNode(props.id)
      if (node) {
        const state: StateController = {
          type: ActionType.UPDATE_NODE_DATA,
          name: 'update node data ' + node.id,
          objectId: node.id,
          oldState: {
            objectPosition: node.position,
            data: oldScheduledFlowControl
          },
          newState: {
            objectPosition: node.position,
            data: newscheduledFlowControl
          }
        }
        addState(state)
        oldScheduledFlowControl = Object.assign({}, newscheduledFlowControl)
      }
    }
  },
  { deep: true }
)

watch(isMenuOpen, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    const node = findNode(props.id)
    if (
      node &&
      (flowControl.value.pressure !== oldFlowControl.pressure ||
        flowControl.value.duration !== oldFlowControl.duration ||
        flowControl.value.flowrate !== oldFlowControl.flowrate ||
        scheduledFlowControl.value.totalDuration !== oldScheduledFlowControl.totalDuration)
    ) {
      const state: StateController = {
        type: ActionType.UPDATE_NODE_DATA,
        name: 'update node data ' + node.id,
        objectId: node.id,
        oldState: {
          objectPosition: node.position,
          data: oldScheduledFlowControl
        },
        newState: {
          objectPosition: node.position,
          data: scheduledFlowControl.value
        }
      }
      addState(state)
      oldFlowControl = Object.assign({}, flowControl.value)
    }
  }
})

function deleteSelectedElements() {
  const node = findNode(props.id)
  if (node) {
    removeNodes([node])
    const state = createState(node, ActionType.DELETE_NODE)
    addState(state)
  }
}
</script>
