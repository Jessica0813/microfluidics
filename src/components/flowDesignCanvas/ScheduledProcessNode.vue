<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import type { FlowConfigs } from '@/types/flowControl'
import RangeBarChart from './RangeBarChart.vue'
import ScheduledProcessEditDialog from './ScheduledProcessEditDialog.vue'
import RangBar from './RangeBar.vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useVueFlow } from '@vue-flow/core'

const { selected, dimensions} = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const nodeRef = ref<HTMLDivElement | null>(null)

const data1: FlowConfigs = {
  startTime: 0,
  endTime: 12,
  duration: 12,
  flowControlList: [
    {
      inlet: 'inlet 1',
      injection: 'droplet',
      fluid: 'water',
      pressure: 3000
    },
    {
      inlet: 'inlet 2',
      injection: 'droplet',
      fluid: 'water',
      pressure: 2000
    }
  ]
}

const data2: FlowConfigs = {
  startTime: 13,
  endTime: 16,
  duration: 3,
  flowControlList: [
    {
      inlet: 'inlet 1',
      injection: 'droplet',
      fluid: 'water',
      pressure: 3000
    },
    {
      inlet: 'inlet 2',
      injection: 'droplet',
      fluid: 'water',
      pressure: 2000
    },
    {
      inlet: 'inlet 3',
      injection: 'droplet',
      fluid: 'water',
      pressure: 2000
    }
  ]
}

// const data3: FlowConfigs = {
//   startTime: 17,
//   endTime: 19,
//   duration: 2,
//   flowControlList: [
//     {
//       inlet: 'inlet 1',
//       injection: 'droplet',
//       fluid: 'water',
//       pressure: 3000
//     }
//   ]
// }

const totalDuration = ref<number>(20)
const flowControlProcesses = ref<FlowConfigs[]>([])

function addFlowConfigs(flowConfigs: FlowConfigs) {
  flowControlProcesses.value.push(flowConfigs)
}

// function removeFlowConfigs(index: number) {
//   flowControlProcesses.value.splice(index, 1)
// }

addFlowConfigs(data1)
addFlowConfigs(data2)
// addFlowConfigs(data3)
</script>

<template>
  <div
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      height: '100%',
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
    ref="nodeRef"
  >
    <NodeResizer :minWidth="400" :minHeight="150" />
    <Handle
      type="source"
      :position="Position.Top"
      :class="selected || nodeIsHovered ? '' : 'top-handle'"
    />
    <Handle
      type="source"
      :position="Position.Bottom"
      :class="selected || nodeIsHovered ? '' : 'bottom-handle'"
    />
    <Handle
      type="source"
      :position="Position.Right"
      :class="selected || nodeIsHovered ? '' : 'right-handle'"
    />
    <Handle
      type="source"
      :position="Position.Left"
      :class="selected || nodeIsHovered ? '' : 'left-handle'"
    />
    <div style="background-color: #eeeeee; border-radius: 4px; height: 100%;">
      <div class="d-flex align-center pt-3 pb-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-chart-gantt</v-icon>
        <p class="text-subtitle-2">
          {{ 'Duration: ' + totalDuration }}
        </p>
        <v-spacer></v-spacer>
        <ScheduledProcessEditDialog
          :flowControlProcesses="flowControlProcesses"
          :totalDuration="totalDuration"
        />
      </div>
      <v-divider thickness="2" />
      <!-- <RangeBarChart
        :flowControlProcesses="flowControlProcesses"
        :totalDuration="totalDuration"
        :width="368"
      /> -->
      <div :style="{paddingTop: '10px', paddingBottom: '20px',  paddingLeft:'10px', paddingRight:'10px', height: '80%'}">
        <RangBar/>
      </div>
    </div>
  </div>
</template>
