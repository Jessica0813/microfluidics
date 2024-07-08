<template>
  <div class="bar">
    <v-menu offset="10" v-model="isSensorMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Sensor' }">
          <v-icon size="small" color="#66615b">mdi-leak</v-icon>
        </button>
      </template>
      <SensorDropdown :items="sensors" :node-id="id" v-model:selected="condition.sensor" />
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
      v-if="condition.sensor === null || condition.sensor.type === SensorType.Color"
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
    <v-menu :close-on-content-click="false" offset="10" v-else v-model="isMeasurementMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props" v-tippy="{ content: 'Measurement' }">
          <v-icon size="small" color="#66615b">mdi-numeric</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="condition.measurement" />
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
import { storeToRefs } from 'pinia'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { SensorType } from '@/types/sensor'
import type { Condition } from '@/types/node'
import { useStateStore } from '@/stores/useStateStore'
import { useSensorStore } from '@/stores/useSensorStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import SensorDropdown from '../general/SensorDropdown.vue'
// import CustomizedColorInput from '../general/CustomizedColorInput.vue'

const props = defineProps<{
  id: string | null
  isEditMenuOpen: boolean
}>()

const isSensorMenuOpen = ref(false)
const isOperatorMenuOpen = ref(false)
const isColorMenuOpen = ref(false)
const isMeasurementMenuOpen = ref(false)

const { sensors } = storeToRefs(useSensorStore())
const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()

const condition = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.condition === undefined) {
    return {
      name: 'xxx',
      sensor: null,
      operator: '=',
      color: '#FFFFFF',
      measurement: 0
    }
  }
  return data.condition
})

const dynamicOperators = ref<string[]>(
  condition.value.sensor === null || condition.value.sensor.type === SensorType.Color
    ? ['=', '!=', 'is Like']
    : ['=', '!=', '>', '<', '>=', '<=']
)

let oldCondition = JSON.parse(JSON.stringify(condition.value))

watch(
  () => props.isEditMenuOpen,
  (newValue) => {
    if (!newValue) {
      isColorMenuOpen.value = false
      isMeasurementMenuOpen.value = false
    }
  }
)

function updateState(newCondition: Condition) {
  const node = findNode(props.id)
  if (!node) {
    return
  }
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

watch(isSensorMenuOpen, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    let newCondition = JSON.parse(JSON.stringify(condition.value))
    if (
      (oldCondition.sensor &&
        newCondition.sensor &&
        newCondition.sensor.id !== oldCondition.sensor.id) ||
      (!oldCondition.sensor && newCondition.sensor !== oldCondition.sensor)
    ) {
      const node = findNode(props.id)
      if (!node) {
        return
      }
      dynamicOperators.value =
        newCondition.sensor === null || newCondition.sensor.type === SensorType.Color
          ? ['=', '!=', 'is Like']
          : ['=', '!=', '>', '<', '>=', '<=']
      condition.value.operator = dynamicOperators.value[0]
      condition.value.measurement = 0
      condition.value.color = '#FFFFFF'
      newCondition = JSON.parse(JSON.stringify(condition.value))

      updateState(newCondition)
    }
  }
})

function compareAndUpdateState(newValue: boolean, oldValue: boolean) {
  if (newValue === false && oldValue === true) {
    const newCondition = JSON.parse(JSON.stringify(condition.value))
    if (
      newCondition.operator !== oldCondition.operator ||
      newCondition.color !== oldCondition.color ||
      newCondition.measurement !== oldCondition.measurement
    ) {
      updateState(newCondition)
    }
  }
}

watch(isOperatorMenuOpen, (newValue, oldValue) => {
  compareAndUpdateState(newValue, oldValue)
})

watch(isColorMenuOpen, (newValue, oldValue) => {
  compareAndUpdateState(newValue, oldValue)
})

watch(isMeasurementMenuOpen, (newValue, oldValue) => {
  compareAndUpdateState(newValue, oldValue)
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
