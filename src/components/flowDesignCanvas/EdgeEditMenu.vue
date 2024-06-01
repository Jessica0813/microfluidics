<template>
  <div class="bar">
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { createDeleteEdgeState } from '@/composables/useStateCreation'
import { useStateStore } from '@/stores/useStateStore'

const props = defineProps<{
  id: string | null
}>()

const { addState } = useStateStore()
const { findEdge, removeEdges } = useVueFlow()

function deleteSelectedElements() {
  const edge = findEdge(props.id)
  if (edge) {
    const state = createDeleteEdgeState([edge], removeEdges)
    if (state) {
      addState(state)
    }
  }
}
</script>
