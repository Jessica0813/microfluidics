<template>
  <div class="menu">
    <label for="uploadSvg" class="button">
      <p>svg</p>
      <input type="file" id="uploadSvg" accept=".svg" style="display: none" />
    </label>
    <label for="uploadJson" class="button">
      <p>json</p>
      <input
        type="file"
        id="uploadJson"
        accept=".json"
        style="display: none"
        @change="handleJsonUpload"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { useNodeIdStore } from '@/stores/useNodeIdStore'

const { addNodes, addEdges } = useVueFlow()
const { initIndexes } = useNodeIdStore()

function handleJsonUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result !== 'string') return

    const data = JSON.parse(result)

    addNodes([...data.nodes])

    setTimeout(() => {
      addEdges([...data.edges])
    }, 800)

    initIndexes(data.indexes)
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  font-size: 14px;
  min-width: 60px;
}
.button {
  text-align: center;
  padding: 4px 0px;
  cursor: pointer;
}
.button:hover {
  background-color: #e0e0e0;
}
</style>
