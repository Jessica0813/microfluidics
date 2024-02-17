<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import RangBarChart from './RangeBarChart.vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { ScheduledFlowControl, FlowControlProcess } from '@/types/flowControl'
import ScheduledProcessEditMenu from './ScheduledProcessEditMenu.vue'
import { flip, shift, computePosition, offset } from '@floating-ui/vue'

let processId = 1
function getProcessId() {
  return `${processId++}`
}
const { selected, id, data } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const isMenuOpen = ref(false)
const targetRef = ref<HTMLDivElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const isEditingProcess = ref(false)
const editedProcess = ref<FlowControlProcess>({
  id: '',
  name: '',
  selected: false,
  startTime: 0,
  endTime: 0,
  duration: 0,
  inlet: '',
  injection: '',
  fluid: '',
  pressure: 0
})

const scheduledFlowControl = ref<ScheduledFlowControl>(data.scheduledFlowControl)

function calculatePosition() {
  if (!targetRef.value || !floatingRef.value) {
    return
  }

  try {
    computePosition(targetRef.value, floatingRef.value, {
      placement: 'right',
      middleware: [offset(5), flip(), shift()]
    }).then((pos) => {
      Object.assign(floatingRef.value!.style, {
        left: `${pos.x}px`,
        top: `${pos.y}px`
      })
    })
  } catch (error) {
    console.error('Error calculating position:', error)
  }
}

watch(isEditingProcess, () => {
  if (isEditingProcess.value) {
    calculatePosition()
  }
})

function onTrigger() {
  if (isEditingProcess.value) {
    isMenuOpen.value = true
    isEditingProcess.value = false
    updateProcess()
  } else {
    isMenuOpen.value = !isMenuOpen.value
  }

  if (isMenuOpen.value) {
    calculatePosition()
  }
}

function onClickOutside() {
  isMenuOpen.value = false
  isEditingProcess.value = false
  updateProcess()
}

function updateProcess() {
  if (editedProcess.value.id) {
    editedProcess.value.selected = false
  }
}

function addProcess() {
  const id = getProcessId()
  scheduledFlowControl.value.processes.push({
    id: id,
    name: id,
    selected: false,
    startTime: 0.0,
    endTime: 1.0,
    duration: 1.0,
    inlet: 'Inlet 1',
    injection: 'Injection Type A',
    fluid: 'water',
    pressure: 0
  })
}
</script>

<template>
  <div
    v-click-outside="{
      handler: onClickOutside
    }"
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      height: '100%',
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
    ref="targetRef"
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
      <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-chart-gantt</v-icon>
        <p class="text-subtitle-2">
          {{ scheduledFlowControl.name }}
        </p>
        <v-spacer></v-spacer>
        <div @click="onTrigger">
          <v-icon size="small" color="grey-darken-3"> mdi-dots-vertical</v-icon>
        </div>
      </div>
      <v-divider thickness="2" />
      <div class="d-flex align-center py-2 px-5">
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
          height: 62%;
        "
      >
        <RangBarChart
          :id="id"
          :totalDuration="scheduledFlowControl.totalDuration"
          v-model:isMenuOpen="isMenuOpen"
          v-model:isEditingProcess="isEditingProcess"
          v-model:editedProcess="editedProcess"
          v-model:flowControlProcesses="scheduledFlowControl.processes"
        />
      </div>
    </div>
    <div ref="floatingRef" style="position: absolute; z-index: 1000" v-show="isMenuOpen">
      <ScheduledProcessEditMenu
        :id="id"
        :isEditingProcess="isEditingProcess"
        v-model:nodeName="scheduledFlowControl.name"
        v-model:totalDuration="scheduledFlowControl.totalDuration"
        v-model:processName="editedProcess.name"
        v-model:inlet="editedProcess.inlet"
        v-model:injection="editedProcess.injection"
        v-model:fluid="editedProcess.fluid"
        v-model:pressure="editedProcess.pressure"
        v-model:startTime="editedProcess.startTime"
        v-model:endTime="editedProcess.endTime"
      />
    </div>
  </div>
</template>
