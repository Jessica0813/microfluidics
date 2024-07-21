<template>
  <div class="bar">
    <v-menu
      offset="10"
      v-model="isFluidMenuOpen"
      @update:model-value="(value) => updateState(value)"
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
      @update:model-value="(value) => updateState(value)"
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
      @update:model-value="(value) => updateState(value)"
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
      @update:model-value="(value) => updateState(value)"
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
      v-model="isViscosityMenuOpen"
      @update:model-value="(value) => updateState(value)"
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
      v-model="isDurationMenuOpen"
      @update:model-value="(value) => updateState(value)"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Duration' }">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.duration" />
    </v-menu>
    <button
      class="customized-button"
      @click="deleteSelectedElements"
      v-tippy="{ content: 'Delete' }"
    >
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch, ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'
import type { FlowControl } from '@/types/node'
import { useFluidStore } from '@/stores/useFluidStore'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import FluidDropdown from '../general/FluidDropdown.vue'

const props = defineProps<{
  id: string | null
  isEditMenuOpen: boolean
}>()

const isFluidMenuOpen = ref(false)
const isInletMenuOpen = ref(false)
const isInjectionMenuOpen = ref(false)
const isPressureMenuOpen = ref(false)
const isViscosityMenuOpen = ref(false)
const isDurationMenuOpen = ref(false)

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()
const { fluids } = storeToRefs(useFluidStore())

const flowControl = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.flowControl === undefined) {
    return {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: null,
      pressure: 0,
      duration: 0,
      flowrate: 0
    }
  }
  return data.flowControl
})

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
let oldFlowControl: FlowControl = JSON.parse(JSON.stringify(flowControl.value))

watch(
  () => props.isEditMenuOpen,
  (newValue, oldValue) => {
    if (!newValue && oldValue) {
      isFluidMenuOpen.value = false
      isInletMenuOpen.value = false
      isInjectionMenuOpen.value = false
      isPressureMenuOpen.value = false
      isViscosityMenuOpen.value = false
      isDurationMenuOpen.value = false
      updateState(false)
    }
  }
)

function updateState(newValue: boolean) {
  if (newValue === false) {
    const node = findNode(props.id)
    if (!node) {
      return
    }
    if (
      flowControl.value.pressure !== oldFlowControl.pressure ||
      flowControl.value.duration !== oldFlowControl.duration ||
      flowControl.value.flowrate !== oldFlowControl.flowrate ||
      (!oldFlowControl.fluid && flowControl.value.fluid !== oldFlowControl.fluid) ||
      (oldFlowControl.fluid &&
        flowControl.value.fluid &&
        flowControl.value.fluid.id !== oldFlowControl.fluid.id) ||
      flowControl.value.injection !== oldFlowControl.injection ||
      flowControl.value.inlet !== oldFlowControl.inlet
    ) {
      const newFlowControl = JSON.parse(JSON.stringify(flowControl.value))
      const state: StateController = {
        type: ActionType.UPDATE_NODE_DATA,
        name: 'update node data ' + node.id,
        objectId: node.id,
        oldState: {
          objectPosition: node.position,
          data: oldFlowControl
        },
        newState: {
          objectPosition: node.position,
          data: newFlowControl
        }
      }
      addState(state)
      oldFlowControl = newFlowControl
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
</script>
@/types/node
