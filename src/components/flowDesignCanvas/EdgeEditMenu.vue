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
</style>
