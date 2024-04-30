<template>
  <div class="bar">
    <button class="customized-button" @click="deleteSelectedElements">
      <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'

const { findEdge, removeEdges } = useVueFlow()
const props = defineProps<{
  id: string | null
}>()

function deleteSelectedElements() {
  const node = findEdge(props.id)
  if (node) {
    removeEdges([node])
  }
}
</script>
