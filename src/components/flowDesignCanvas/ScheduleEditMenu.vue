<template>
  <div class="bar" v-if="!isChildProcessSelected">
    <v-menu
      :close-on-content-click="false"
      offset="10"
      v-model="isTotalDurationMenuOpen"
      @update:model-value="(value) => onTotalDurationChange(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Duration' }">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="scheduledFlowControl.totalDuration" />
    </v-menu>
    <button
      class="customized-button"
      @click="deleteSelectedElements"
      v-tippy="{ content: 'Delete' }"
    >
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
  <div class="bar" v-else>
    <v-menu
      offset="10"
      v-model="isFluidMenuOpen"
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Fluid' }">
          <v-icon size="small" color="#66615b">mdi-waves</v-icon>
        </button>
      </template>
      <FluidDropdown v-model:selected="flowControl.fluid" :items="fluids" />
    </v-menu>
    <v-menu
      offset="10"
      v-model="isInletMenuOpen"
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Inlet' }">
          <v-icon size="small" color="#66615b">mdi-location-enter</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="flowControl.inlet" :items="inlets" />
    </v-menu>
    <v-menu
      offset="10"
      v-model="isInjectionMenuOpen"
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Injection' }">
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
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Pressure' }">
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
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Flowrate' }">
          <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.flowrate" />
    </v-menu>
    <v-menu
      :close-on-content-click="false"
      offset="10"
      v-model="isSubProcessDurationMenuOpen"
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Time Range' }">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <div class="time-menu">
        <CustomizedNumberInput
          v-model:number="flowControl.startTime"
          :is-large-width="false"
          :min="0"
          :max="flowControl.endTime"
        />
        <p style="padding: 0px 4px">-</p>
        <CustomizedNumberInput
          v-model:number="flowControl.endTime"
          :is-large-width="false"
          :min="flowControl.startTime"
          :max="scheduledFlowControl.totalDuration"
        />
      </div>
    </v-menu>
    <v-menu
      offset="10"
      v-model="isInletStateMenuOpen"
      @update:model-value="(value) => compareAndUpdateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Inlet State' }">
          <v-icon size="small" color="#66615b">mdi-transit-connection-horizontal</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="flowControl.inletState" :items="inletStates" />
    </v-menu>
    <button class="customized-button" @click="deleteSubprocess" v-tippy="{ content: 'Delete' }">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useVueFlow } from '@vue-flow/core'

import { type StateController, ActionType } from '@/types/stateController'
import type { FlowControlProcess, ScheduledFlowControl } from '@/types/node'

import { createDeleteNodeState } from '@/composables/useStateCreation'

import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'
import { useFluidStore } from '@/stores/useFluidStore'
import { useStateStore } from '@/stores/useStateStore'

import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import FluidDropdown from '../general/FluidDropdown.vue'

const props = defineProps<{
  id: string | null
  isEditMenuOpen: boolean
}>()

const flowControl = defineModel<FlowControlProcess>('editedFlowControl', {
  default: {
    id: '-1',
    selected: false,
    startTime: 0,
    endTime: 1,
    duration: 1,
    inlet: 'inlet 1',
    injection: 'pump',
    fluid: null,
    pressure: 0,
    flowrate: 0,
    inletState: 'connect'
  }
})

const isTotalDurationMenuOpen = ref(false)
const isFluidMenuOpen = ref(false)
const isInletMenuOpen = ref(false)
const isInjectionMenuOpen = ref(false)
const isPressureMenuOpen = ref(false)
const isFlowrateMenuOpen = ref(false)
const isSubProcessDurationMenuOpen = ref(false)
const isInletStateMenuOpen = ref(false)

const isChildProcessSelected = ref(false)
const editedProcessId = ref(-1)

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()
const { isDraggingOrResizingSubProcess } = storeToRefs(useFlowChartCanvasStore())
const { fluids } = storeToRefs(useFluidStore())

const scheduledFlowControl = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.scheduledFlowControl === undefined) {
    return {
      totalDuration: 20,
      processes: []
    }
  }
  return data.scheduledFlowControl
})

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
const inletStates = ['connect', 'block']
let oldScheduledFlowControl = JSON.parse(JSON.stringify(scheduledFlowControl.value))
let oldFlowControl = Object.assign({}, flowControl.value)

watch(isDraggingOrResizingSubProcess, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    oldScheduledFlowControl = JSON.parse(JSON.stringify(scheduledFlowControl.value))
  }
})

watch(
  () => props.isEditMenuOpen,
  (newValue) => {
    if (!newValue) {
      isTotalDurationMenuOpen.value = false
      isPressureMenuOpen.value = false
      isFlowrateMenuOpen.value = false
      isSubProcessDurationMenuOpen.value = false
      isFluidMenuOpen.value = false
      isInletMenuOpen.value = false
      isInjectionMenuOpen.value = false
      if (isChildProcessSelected.value) {
        compareAndUpdateState(false)
      } else {
        onTotalDurationChange(false)
      }
    }
  }
)

watch(
  () => scheduledFlowControl.value.processes,
  () => {
    let i
    for (i = 0; i < scheduledFlowControl.value.processes.length; i++) {
      if (scheduledFlowControl.value.processes[i].selected) {
        flowControl.value = scheduledFlowControl.value.processes[i]
        isChildProcessSelected.value = true
        editedProcessId.value = i
        break
      }
    }
    if (i === scheduledFlowControl.value.processes.length) {
      flowControl.value = {
        id: '-1',
        selected: false,
        startTime: 0,
        endTime: 1,
        duration: 1,
        inlet: 'inlet 1',
        injection: 'pump',
        fluid: null,
        pressure: 0,
        flowrate: 0,
        inletState: 'connect'
      }
      isChildProcessSelected.value = false
      editedProcessId.value = -1
    }
  },
  {
    deep: true,
    immediate: true
  }
)

function updataState(newData: ScheduledFlowControl, changedSubprocessId: string | undefined) {
  const node = findNode(props.id)
  if (node) {
    const state: StateController = {
      type: ActionType.UPDATE_NODE_DATA,
      name: 'update node data ' + node.id,
      objectId: node.id,
      oldState: {
        objectPosition: node.position,
        data: oldScheduledFlowControl,
        changedSubprocessId: changedSubprocessId
      },
      newState: {
        objectPosition: node.position,
        data: newData,
        changedSubprocessId: changedSubprocessId
      }
    }
    addState(state)
    oldScheduledFlowControl = newData
  }
}

function onTotalDurationChange(value: boolean) {
  if (value === false) {
    const node = findNode(props.id)
    const newData = JSON.parse(JSON.stringify(scheduledFlowControl.value))
    if (node && newData.totalDuration !== oldScheduledFlowControl.totalDuration) {
      updataState(newData, undefined)
    }
  }
}

function compareAndUpdateState(newValue: boolean) {
  if (newValue === false) {
    let newData = JSON.parse(JSON.stringify(scheduledFlowControl.value))
    if (editedProcessId.value !== -1) {
      oldScheduledFlowControl.processes[editedProcessId.value].selected = false
      newData.processes[editedProcessId.value].selected = false
    }
    if (JSON.stringify(newData) !== JSON.stringify(oldScheduledFlowControl)) {
      if (
        flowControl.value.pressure !== oldFlowControl.pressure ||
        flowControl.value.duration !== oldFlowControl.duration ||
        flowControl.value.flowrate !== oldFlowControl.flowrate ||
        (!oldFlowControl.fluid && flowControl.value.fluid !== oldFlowControl.fluid) ||
        (oldFlowControl.fluid &&
          flowControl.value.fluid &&
          flowControl.value.fluid.id !== oldFlowControl.fluid.id) ||
        flowControl.value.injection !== oldFlowControl.injection ||
        flowControl.value.inlet !== oldFlowControl.inlet ||
        flowControl.value.inletState !== oldFlowControl.inletState
      ) {
        updataState(newData, flowControl.value.id)
      } else if (
        flowControl.value.startTime !== oldFlowControl.startTime ||
        flowControl.value.endTime !== oldFlowControl.endTime
      ) {
        flowControl.value.duration = flowControl.value.endTime - flowControl.value.startTime
        newData = JSON.parse(JSON.stringify(scheduledFlowControl.value))
        newData.processes[editedProcessId.value].selected = false
        updataState(newData, flowControl.value.id)
      }
      oldFlowControl = Object.assign({}, flowControl.value)
    }
  }
}

function deleteSelectedElements() {
  if (props.id !== null) {
    const node = findNode(props.id)
    if (!node) {
      return
    }
    let connectedEdges = getConnectedEdges(props.id)
    const state = createDeleteNodeState([node], connectedEdges, removeNodes, removeEdges)
    if (state) {
      addState(state)
    }
  }
}

function deleteSubprocess() {
  if (editedProcessId.value !== -1) {
    oldScheduledFlowControl.processes[editedProcessId.value].selected = false
    scheduledFlowControl.value.processes.splice(editedProcessId.value, 1)
    editedProcessId.value = -1
    const newData = JSON.parse(JSON.stringify(scheduledFlowControl.value))
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
          data: newData
        }
      }
      addState(state)
      oldScheduledFlowControl = newData
    }
  }
}
</script>

<style scoped>
.time-menu {
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 4px;
}
</style>
@/types/node
