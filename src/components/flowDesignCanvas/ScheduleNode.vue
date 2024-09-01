<template>
  <div
    class="new-node"
    @click="unselectProcess"
    :id="id"
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      height: '100%',
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
  >
    <NodeResizer :minWidth="300" :minHeight="150" :color="'transparent'" v-if="selected" />
    <Handle
      :id="id + '-top-handle'"
      type="source"
      :position="Position.Top"
      :class="selected || nodeIsHovered ? '' : 'top-handle'"
    />
    <Handle
      :id="id + '-bottom-handle'"
      type="source"
      :position="Position.Bottom"
      :class="selected || nodeIsHovered ? '' : 'bottom-handle'"
    />
    <Handle
      :id="id + '-right-handle'"
      type="source"
      :position="Position.Right"
      :class="selected || nodeIsHovered ? '' : 'right-handle'"
    />
    <Handle
      :id="id + '-left-handle'"
      type="source"
      :position="Position.Left"
      :class="selected || nodeIsHovered ? '' : 'left-handle'"
    />
    <div
      style="
        background-color: #eeeeee;
        border-radius: 4px;
        height: 100%;
        min-height: 150px;
        min-width: 300px;
      "
    >
      <div class="d-flex align-center py-3 px-4">
        <p style="font-size: 12px">
          {{ 'Total Duration: ' + scheduledFlowControl.totalDuration + 's' }}
        </p>
      </div>
      <div
        style="
          padding-top: 5px;
          padding-bottom: 20px;
          padding-left: 12px;
          padding-right: 12px;
          height: 75%;
        "
      >
        <RangBarChart
          :id="id"
          v-model:scheduledFlowControl="scheduledFlowControl"
          v-model:flowControlProcesses="scheduledFlowControl.processes"
          v-model:edited-process="editedProcess"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { FlowControlProcess } from '@/types/node'
import RangBarChart from './RangeBarChart.vue'

const { selected, id, data } = defineProps<NodeProps>()

const nodeIsHovered = ref(false)
const editedProcess = ref<FlowControlProcess>()

const scheduledFlowControl = computed(() => {
  if (data === undefined || data.scheduledFlowControl === undefined) {
    return {
      totalDuration: 0,
      processes: []
    }
  }
  return data.scheduledFlowControl
})

const { findNode } = useVueFlow()

const isSelected = computed(() => {
  const node = findNode(id)
  if (node) {
    return node.selected
  }
  return false
})

watch(isSelected, (newValue) => {
  if (newValue === false) {
    if (editedProcess.value) {
      editedProcess.value.selected = false
    }
  } else {
    // loop through subProcess set editedProcess Value
    scheduledFlowControl.value.processes.forEach((process: any) => {
      if (process.selected) {
        editedProcess.value = process
      }
    })
  }
})

function unselectProcess() {
  if (editedProcess.value) {
    editedProcess.value.selected = false
  }
}
</script>
