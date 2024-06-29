<template>
  <div class="d-flex ga-2">
    <div class="d-flex button-group ml-2">
      <v-menu offset="1" z-index="5">
        <template v-slot:activator="{ props }">
          <button class="icon-button with-right-border" v-bind="props">
            <v-icon color="#66615b" size="small">mdi-upload</v-icon>
          </button>
        </template>
        <UploadMenu />
      </v-menu>
      <button class="icon-button" @click="downloadData">
        <v-icon color="#66615b" size="small">mdi-download</v-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import type { NodeExportModel, EdgeExportModel } from '../../types/exportObject'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import UploadMenu from './UploadMenu.vue'

const { nodes, edges } = useVueFlow()
const { getIndexes } = useNodeIdStore()

// console.log('1', nodes.value)
// console.log('2', edges.value)

let nodeExportData: NodeExportModel[] = []
let edgeExportData: EdgeExportModel[] = []

function downloadData() {
  for (const node of nodes.value) {
    const exportNode = {
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }
    nodeExportData.push(exportNode)
  }

  for (const edge of edges.value) {
    const exportEdge = {
      id: edge.id,
      type: edge.type,
      label: edge.label,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }
    edgeExportData.push(exportEdge)
  }

  const exportData = {
    nodes: nodeExportData,
    edges: edgeExportData,
    indexes: getIndexes()
  }

  const stringifiedData = JSON.stringify(exportData)

  // Create a Blob from the JSON string
  const blob = new Blob([stringifiedData], { type: 'application/json' })

  // Create a link element
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const aId = 'downloadLink'
  a.id = aId
  a.href = url
  a.download = 'flowChartCanvas.json'

  // Programmatically click the link to trigger the download
  document.body.appendChild(a)
  a.click()

  // Clean up by removing the link element
  document.body.removeChild(document.getElementById(aId)!)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
