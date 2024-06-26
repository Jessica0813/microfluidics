<template>
  <div class="bar">
    <v-menu offset="10" v-model="isFluidMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Fluid' }">
          <v-icon size="small" color="#66615b">mdi-waves</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="flowControl.fluid" :items="fluidNames" />
    </v-menu>
    <v-menu offset="10" v-model="isInletMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Inlet' }">
          <v-icon size="small" color="#66615b">mdi-location-enter</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="flowControl.inlet" :items="inlets" />
    </v-menu>
    <v-menu offset="10" v-model="isInjectionMenuOpen">
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
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Flowrate' }">
          <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.flowrate" />
    </v-menu>
    <v-menu :close-on-content-click="false" offset="10" v-model="isDurationMenuOpen">
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
import { computed, watch, ref } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'
import type { FlowControl } from '@/types/flowControl'
import { useFluidStore } from '@/stores/useFluidStore'
import { storeToRefs } from 'pinia'

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

const isMenuOpen = computed(() => {
  return (
    isFluidMenuOpen.value ||
    isInletMenuOpen.value ||
    isInjectionMenuOpen.value ||
    isPressureMenuOpen.value ||
    isViscosityMenuOpen.value ||
    isDurationMenuOpen.value
  )
})

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()
const { fluidNames } = storeToRefs(useFluidStore())

const flowControl = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.flowControl === undefined) {
    return {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: 'water',
      pressure: 0,
      duration: 0,
      flowrate: 0
    }
  }
  return data.flowControl
})

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
let oldFlowControl: FlowControl = Object.assign({}, flowControl.value)

watch(
  () => props.isEditMenuOpen,
  (newValue, oldValue) => {
    if (!newValue && oldValue) {
      if (isMenuOpen.value) {
        isPressureMenuOpen.value = false
        isViscosityMenuOpen.value = false
        isDurationMenuOpen.value = false
      }
    }
  }
)

watch(isMenuOpen, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    const node = findNode(props.id)
    if (
      node &&
      (flowControl.value.pressure !== oldFlowControl.pressure ||
        flowControl.value.duration !== oldFlowControl.duration ||
        flowControl.value.flowrate !== oldFlowControl.flowrate ||
        flowControl.value.fluid !== oldFlowControl.fluid ||
        flowControl.value.injection !== oldFlowControl.injection ||
        flowControl.value.inlet !== oldFlowControl.inlet)
    ) {
      const newFlowControl = Object.assign({}, flowControl.value)
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
})

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
