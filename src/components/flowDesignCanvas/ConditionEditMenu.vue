<template>
  <div class="bar">
    <v-menu offset="10" v-model="isSensorMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Sensor' }">
          <v-icon size="small" color="#66615b">mdi-leak</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="condition.sensor" :items="sensors" />
    </v-menu>
    <v-menu offset="10" v-model="isOperatorMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Operator' }">
          <v-icon size="small" color="#66615b">mdi-compare-horizontal</v-icon>
        </button>
      </template>
      <CustomizedDropdown v-model:selected="condition.operator" :items="dynamicOperators" />
    </v-menu>
    <!-- <CustomizedColorInput
      v-model:color="condition.color"
      v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
    /> -->
    <v-menu
      v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
      v-model="isColorMenuOpen"
      :close-on-content-click="false"
      offset="10"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Color' }">
          <v-icon size="small" color="#66615b">mdi-select-color</v-icon>
        </button>
      </template>
      <v-color-picker
        v-model="condition.color"
        hide-sliders
        width="300px"
        mode="hex"
      ></v-color-picker>
    </v-menu>
    <v-menu
      :close-on-content-click="false"
      offset="10"
      v-else-if="condition.sensor === 'viscosity sensor'"
      v-model="isViscosityMenuOpen"
    >
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Viscosity' }">
          <v-icon size="small" color="#66615b">mdi-numeric</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="condition.viscosity" />
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
import { computed, ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
// import CustomizedColorInput from '../general/CustomizedColorInput.vue'

const props = defineProps<{
  id: string | null
  isEditMenuOpen: boolean
}>()

const isSensorMenuOpen = ref(false)
const isOperatorMenuOpen = ref(false)
const isColorMenuOpen = ref(false)
const isViscosityMenuOpen = ref(false)

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()

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

const dynamicOperators = computed(() => {
  const selectedSensor = condition.value.sensor

  if (selectedSensor === 'color sensor' || selectedSensor === undefined) {
    return ['=', '!=']
  } else if (selectedSensor === 'viscosity sensor') {
    return ['>', '<', '=', '!=', '>=', '<=']
  } else {
    return []
  }
})

const isMenuOpen = computed(() => {
  return (
    isSensorMenuOpen.value ||
    isOperatorMenuOpen.value ||
    isColorMenuOpen.value ||
    isViscosityMenuOpen.value
  )
})

const sensors = ['color sensor', 'viscosity sensor']
let oldCondition = Object.assign({}, condition.value)

watch(
  () => props.isEditMenuOpen,
  (newValue) => {
    if (!newValue) {
      isColorMenuOpen.value = false
      isViscosityMenuOpen.value = false
    }
  }
)

watch(
  isMenuOpen,
  (newValue, oldValue) => {
    if (newValue === false && oldValue === true) {
      const node = findNode(props.id)
      const newCondition = Object.assign({}, condition.value)
      if (
        node &&
        (newCondition.viscosity !== oldCondition.viscosity ||
          newCondition.color !== oldCondition.color ||
          newCondition.sensor !== oldCondition.sensor ||
          newCondition.operator !== oldCondition.operator)
      ) {
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
            data: newCondition
          }
        }
        addState(state)
        oldCondition = newCondition
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
