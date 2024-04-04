<template>
  <div class="bar">
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
      v-model="isViscosityMenuOpen"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="flowControl.flowrate" />
    </v-menu>
    <v-menu :close-on-content-click="false" offset="10" v-model="isDurationMenuOpen">
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
import { computed, watch, ref } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createState } from '@/composables/useStateCreation'

const { findNode, removeNodes } = useVueFlow()
const { addState } = useStateStore()

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['pump', 'needle']
const fluids = ['water', 'oil']
const isPressureMenuOpen = ref(false)
const isViscosityMenuOpen = ref(false)
const isDurationMenuOpen = ref(false)

const isMenuOpen = computed(() => {
  return isPressureMenuOpen.value || isViscosityMenuOpen.value || isDurationMenuOpen.value
})

const props = defineProps<{
  id: string | null
}>()

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

let oldFlowControl = Object.assign({}, flowControl.value)

watch(
  flowControl.value,
  (newFlowControl) => {
    if (newFlowControl && !isMenuOpen.value) {
      const node = findNode(props.id)
      if (node) {
        const state: StateController = {
          type: ActionType.UPDATE_NODE_DATA,
          name: 'update node data ' + node.id,
          objectId: node.id,
          objectPosition: node.position,
          data: oldFlowControl
        }
        addState(state)
        oldFlowControl = Object.assign({}, newFlowControl)
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
        flowControl.value.flowrate !== oldFlowControl.flowrate)
    ) {
      const state: StateController = {
        type: ActionType.UPDATE_NODE_DATA,
        name: 'update node data ' + node.id,
        objectId: node.id,
        objectPosition: node.position,
        data: oldFlowControl
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
