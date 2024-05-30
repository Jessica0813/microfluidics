<template>
  <div class="bar">
    <v-menu :close-on-content-click="false" offset="10" v-model="isPauseMenuOpen">
      <template v-slot:activator="{ props }">
        <button class="customized-button" v-bind="props">
          <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
        </button>
      </template>
      <CustomizedNumberInput v-model:number="pause.duration" />
    </v-menu>
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'
import { createDeleteNodeState } from '@/composables/useStateCreation'

const props = defineProps<{
  id: string | null
  isEditMenuOpen: boolean
}>()

const { findNode, removeNodes, removeEdges, getConnectedEdges } = useVueFlow()
const { addState } = useStateStore()

const isPauseMenuOpen = ref(false)

const pause = computed(() => {
  const data = findNode(props.id)?.data
  if (data === undefined || data.pause === undefined) {
    return {
      duration: 0
    }
  }
  return data.pause
})

watch(
  () => props.isEditMenuOpen,
  (newValue) => {
    if (!newValue) {
      isPauseMenuOpen.value = false
    }
  }
)

let oldPause = Object.assign({}, pause.value)

watch(isPauseMenuOpen, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    const node = findNode(props.id)
    if (node && pause.value.duration !== oldPause.duration) {
      let newPause = Object.assign({}, pause.value)
      const state: StateController = {
        type: ActionType.UPDATE_NODE_DATA,
        name: 'update node data ' + node.id,
        objectId: node.id,
        oldState: {
          objectPosition: node.position,
          data: oldPause
        },
        newState: {
          objectPosition: node.position,
          data: newPause
        }
      }
      addState(state)
      oldPause = newPause
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
