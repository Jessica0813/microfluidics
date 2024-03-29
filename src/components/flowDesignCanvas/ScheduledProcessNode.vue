<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import RangBarChart from './RangeBarChart.vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { ScheduledFlowControl, FlowControlProcess } from '@/types/flowControl'
import { useVueFlow } from '@vue-flow/core'

const { findNode } = useVueFlow()

let processId = 1
function getProcessId() {
  return `${processId++}`
}
const { selected, id, data } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
// const isMenuOpen = ref(false)
// const isEditingProcess = ref(false)
// const editedProcess = ref<FlowControlProcess>({
//   id: '',
//   name: '',
//   selected: false,
//   startTime: 0,
//   endTime: 0,
//   duration: 0,
//   inlet: '',
//   injection: '',
//   fluid: '',
//   pressure: 0,
//   flowrate: 0
// })

// const scheduledFlowControl = ref<ScheduledFlowControl>({
//   totalDuration: 20,
//   name: id,
//   processes: []
// })

// function onClickOutside() {
//   updateProcess()
//   isMenuOpen.value = false
//   isEditingProcess.value = false
// }

// function updateProcess() {
//   if (editedProcess.value.id) {
//     editedProcess.value.selected = false
//   }
// }

const editedProcess = ref<FlowControlProcess>()

function addProcess() {
  const processId = getProcessId()
  scheduledFlowControl.value.processes.push({
    id: processId,
    name: processId,
    selected: false,
    startTime: 0.0,
    endTime: 1.0,
    duration: 1.0,
    inlet: 'Inlet 1',
    injection: 'pump',
    fluid: 'water',
    pressure: 0,
    flowrate: 0
  })
}

const scheduledFlowControl = computed(() => {
  if (data === undefined || data.scheduledFlowControl === undefined) {
    return {
      totalDuration: 20,
      name: 'a',
      processes: []
    }
  }
  return data.scheduledFlowControl
})

function unselectProcess() {
  //potential bug
  if (editedProcess.value) {
    editedProcess.value.selected = false
  }
}

// watch(()=>selected, (newValue) => {
//   console.log(newValue)
//   if (newValue === false) {
//     unSelectProcess();
//   }
// });

// watch(
//   [isMenuOpen, () => scheduledFlowControl.value.processes],
//   ([newValue], [oldValue]) => {
//     const node = findNode(id)
//     if (node === undefined) {
//       return
//     }
//     const data = node.data

//     if (!newValue && oldValue) {
//       if (data.name !== scheduledFlowControl.value.name) {
//         node.data.scheduledFlowControl = scheduledFlowControl.value
//       }

//       if (data.totalDuration !== scheduledFlowControl.value.totalDuration) {
//         node.data.scheduledFlowControl.totalDuration = scheduledFlowControl.value.totalDuration
//       }

//       if (data.processes !== scheduledFlowControl.value.processes) {
//         node.data.scheduledFlowControl.processes = scheduledFlowControl.value.processes
//       }
//       console.log(node.data.scheduledFlowControl)
//       return
//     }
//     if (data.processes !== scheduledFlowControl.value.processes) {
//       node.data.scheduledFlowControl.processes = scheduledFlowControl.value.processes
//     }
//   },
//   {
//     deep: true
//   }
// )
</script>

<template>
  <div
    @click="unselectProcess"
    v-click-outside="unselectProcess"
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
    <NodeResizer :minWidth="300" :minHeight="150" :color="'transparent'" />
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
      <!-- <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-chart-gantt</v-icon>
        <p class="text-subtitle-2">
          {{ scheduledFlowControl.name }}
        </p>
        <v-spacer></v-spacer>
        <div @click="onTrigger">
          <v-icon size="small" color="grey-darken-3"> mdi-dots-vertical</v-icon>
        </div>
      </div>
      <v-divider thickness="2" /> -->
      <div class="d-flex align-center py-3 px-4">
        <p style="font-size: 12px">
          {{ 'Total Duration: ' + scheduledFlowControl.totalDuration + 's' }}
        </p>
        <v-spacer></v-spacer>
        <v-icon size="small" color="grey-darken-3" @click="addProcess"> mdi-plus</v-icon>
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
          :totalDuration="scheduledFlowControl.totalDuration"
          v-model:flowControlProcesses="scheduledFlowControl.processes"
          v-model:edited-process="editedProcess"
        />
      </div>
    </div>
  </div>
</template>
