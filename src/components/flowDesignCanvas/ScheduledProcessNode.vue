<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import RangBarChart from './RangeBarChart.vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import { useVueFlow } from '@vue-flow/core'
import type { ScheduledFlowControl } from '@/types/flowControl'

const { selected, id } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const nodeRef = ref<HTMLDivElement | null>(null)

const scheduledFlowControl = ref<ScheduledFlowControl>({
  totalDuration: 20,
  name: 'scheduled process',
  processes: [{
    id: '1',
    name: '1',
    startTime: 0.0,
    endTime: 20.0,
    duration: 20,
    inlet: 'Inlet 1',
    injection: 'Injection Type A',
    fluid: 'water',
    pressure: 20
  },
  {
    id: '2',
    name: '2',
    startTime: 0.0,
    endTime: 20.0,
    duration: 20,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '3',
    name: '3',
    startTime: 10.0,
    endTime: 15.0,
    duration: 5,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '4',
    name: '4',
    startTime: 14.0,
    endTime: 16.0,
    duration: 2,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  }]
})

const { findNode } = useVueFlow()

console.log(findNode(id))
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
    <NodeResizer :minWidth="300" :minHeight="150" />
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
    <div style="background-color: #eeeeee; border-radius: 4px; height: 100%">
      <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-chart-gantt</v-icon>
        <p class="text-subtitle-2">
          {{ scheduledFlowControl.name }}
        </p>
        <v-spacer></v-spacer>
        <v-icon size="small" color="grey-darken-3"> mdi-dots-vertical</v-icon>
      </div>
      <v-divider thickness="2" />
      <div class="d-flex align-center py-2 px-5">
        <p style="font-size: 12px;">
          {{ 'Total Duration: ' + scheduledFlowControl.totalDuration + 's'}}
        </p>
        <v-spacer></v-spacer>
        <v-icon size="small" color="grey-darken-3"> mdi-plus</v-icon>
      </div>
      <div
        style="
          padding-top: 5px;
          padding-bottom: 20px;
          padding-left: 12px;
          padding-right: 12px;
          height: 62%;
        "
      >
        <RangBarChart 
        :id="id" 
        :totalDuration="scheduledFlowControl.totalDuration"
        v-model:flowControlProcesses="scheduledFlowControl.processes"
        />
      </div>
    </div>
  </div>
</template>
