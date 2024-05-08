<template>
  <div class="bar">
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { type StateController, ActionType } from '@/types/stateController'
import { useStateStore } from '@/stores/useStateStore'

const { addState } = useStateStore()
const { findEdge, removeEdges } = useVueFlow()
const props = defineProps<{
  id: string | null
}>()

function deleteSelectedElements() {
  const edge = findEdge(props.id)
  if (edge) {
    const state: StateController = {
      type: ActionType.DELETE_EDGE,
      name: 'delete edge ' + props.id,
      objectId: props.id || '',
      oldState: {
        data: '',
        source: edge.source,
        target: edge.target,
        sourceHandleId: edge.sourceHandle || '',
        targetHandleId: edge.targetHandle || ''
      }
    }
    addState(state)
    removeEdges([edge])
  }
}
</script>
