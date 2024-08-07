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
      <v-menu offset="1" z-index="5">
        <template v-slot:activator="{ props }">
          <button class="icon-button" v-bind="props">
            <v-icon color="#66615b" size="small">mdi-download</v-icon>
          </button>
        </template>
        <div class="menu">
          <button class="button" @click="downloadData">Export Data</button>
          <button
            class="button"
            @click="
              async () => {
                await doScreenshot()
              }
            "
          >
            Capture Flow Chart Image
          </button>
        </div>
      </v-menu>
    </div>
  </div>
  <LoadingIndicator v-model:is-dialog-visible="isDialogVisible" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useVueFlow } from '@vue-flow/core'
import type { NodeExportModel, EdgeExportModel } from '../../types/exportObject'
import type { Fluid } from '@/types/fluid.ts'
import { useScreenshot } from '@/composables/useScreenshot'
import { useNodeIdStore } from '@/stores/useNodeIdStore'
import { useFlowChartCanvasStore } from '@/stores/useFlowChartCanvasStore'
import { useFluidStore } from '@/stores/useFluidStore'
import UploadMenu from './UploadMenu.vue'
import LoadingIndicator from '../general/LoadingIndicator.vue'

const { nodes, edges, vueFlowRef, viewport, setViewport, fitView } = useVueFlow()
const { getIndexes } = useNodeIdStore()
const { capture } = useScreenshot()
const { toggleShowPatternedBackground } = useFlowChartCanvasStore()
const { fluids } = storeToRefs(useFluidStore())
const { getFluidIndex } = useFluidStore()

const isDialogVisible = ref(false)
let nodeExportData: NodeExportModel[] = []
let edgeExportData: EdgeExportModel[] = []
let fluidExportData: Fluid[] = []

function downloadData() {
  if (!vueFlowRef.value) {
    console.warn('VueFlow element not found')
    return
  }

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

  for (const fluid of fluids.value) {
    const exportFluid = {
      id: fluid.id,
      name: fluid.name,
      color: fluid.color,
      viscosity: fluid.viscosity,
      withParticle: fluid.withParticle,
      particleSize: fluid.particleSize,
      particleDensity: fluid.particleDensity
    }
    fluidExportData.push(exportFluid)
  }

  const exportData = {
    nodes: nodeExportData,
    edges: edgeExportData,
    fluids: fluidExportData,
    indexes: getIndexes(),
    fluidIndex: getFluidIndex()
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
  a.download = 'flowChartCanvas' + Date.now() + '.json'

  // Programmatically click the link to trigger the download
  document.body.appendChild(a)
  a.click()

  // Clean up by removing the link element
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function doScreenshot() {
  if (!vueFlowRef.value) {
    console.warn('VueFlow element not found')
    return
  }
  let { x, y, zoom } = viewport.value
  toggleShowPatternedBackground()
  await fitView()
  await capture(vueFlowRef.value, { shouldDownload: true })
  setViewport({ x, y, zoom })
  toggleShowPatternedBackground()
}
</script>

<style scoped>
.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}

.menu {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 0.5px solid lightgray;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px;
}
.button {
  text-align: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 2px;
}
.button:hover {
  background-color: #eeeeee;
}
</style>
