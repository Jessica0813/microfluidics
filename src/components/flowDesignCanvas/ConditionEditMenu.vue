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
    <CustomizedColorInput
      v-model:color="condition.color"
      v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
    />
    <v-menu
      :close-on-content-click="false"
      offset="10"
      v-else-if="condition.sensor === 'viscosity sensor'"
      v-model="isMenuOpen"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-numeric</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="condition.viscosity" />
    </v-menu>
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import CustomizedColorInput from '../general/CustomizedColorInput.vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'

const sensors = ['color sensor', 'viscosity sensor']
const isMenuOpen = ref(false)

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()

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

let oldCondition = Object.assign({}, condition.value)

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

watch(
  condition.value,
  (newCondition) => {
    if (newCondition && !isMenuOpen.value) {
      const node = findNode(props.id)
      if (node) {
        const state: StateController = {
          type: ActionType.UPDATE_NODE_DATA,
          name: 'update node data ' + node.id,
          objectId: node.id,
          oldState: {
            objectPosition: node.position,
            data: oldCondition
          },
          newState: {
            objectPosition: node.position,
            data: condition.value
          }
        }
        addState(state)
        oldCondition = Object.assign({}, newCondition)
      }
    }
  },
  { deep: true }
)

watch(
  isMenuOpen,
  (newValue, oldValue) => {
    if (newValue === false && oldValue === true) {
      const node = findNode(props.id)
      if (node && condition.value.viscosity !== oldCondition.viscosity) {
        const state: StateController = {
          type: ActionType.UPDATE_NODE_DATA,
          name: 'update node data ' + node.id,
          objectId: node.id,
          oldState: {
            objectPosition: node.position,
            data: oldCondition
          },
          newState: {
            objectPosition: node.position,
            data: condition.value
          }
        }
        addState(state)
        oldCondition = Object.assign({}, condition.value)
      }
    }
  },
  { deep: true }
)

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
