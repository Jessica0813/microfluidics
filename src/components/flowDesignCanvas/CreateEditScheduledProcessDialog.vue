<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FlowConfigs } from '@/types/flowControl'
const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['droplet', 'Needle']
const fluids = ['water', 'oil']

type InletConfig = {
  inlet: string
  injection: string
  fluid: string
  pressure: number
}

const initialInletConfig: InletConfig = {
  inlet: '',
  injection: '',
  fluid: '',
  pressure: 0
}

const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  isCreateNewProcessMode: {
    type: Boolean,
    default: true
  }
})

const flowControlProcesses = defineModel<FlowConfigs[]>('flowControlProcesses', { default: [] })
const isCreateNewProcessDialogVisible = defineModel<boolean>('isCreateNewProcessDialogVisible', {
  default: false
})
const inletConfigs = ref<InletConfig[]>(
  props.index < 0 ? [initialInletConfig] : flowControlProcesses.value[props.index].flowControlList
)
const startTime = ref<number>(
  props.index < 0 ? 0 : flowControlProcesses.value[props.index].startTime
)
const endTime = ref<number>(props.index < 0 ? 0 : flowControlProcesses.value[props.index].endTime)

watch(
  () => props.index,
  () => {
    inletConfigs.value =
      props.index < 0
        ? [initialInletConfig]
        : flowControlProcesses.value[props.index].flowControlList
    startTime.value = props.index < 0 ? 0 : flowControlProcesses.value[props.index].startTime
    endTime.value = props.index < 0 ? 0 : flowControlProcesses.value[props.index].endTime
    console.log('props.index', props.index)
    console.log('inletConfigs.value', inletConfigs.value)
  }
)

function onAddIconClick() {
  inletConfigs.value.push(initialInletConfig)
}

function onMinusIconClick(index: number) {
  inletConfigs.value.splice(index, 1)
}

function onCancelButtonClick() {
  isCreateNewProcessDialogVisible.value = false
  inletConfigs.value = [initialInletConfig]
}

function onAddOrEditButtonClick() {
  isCreateNewProcessDialogVisible.value = false
  const newFlowControlProcess: FlowConfigs = {
    startTime: startTime.value || 0,
    endTime: endTime.value || 0,
    duration: (endTime.value || 0) - (startTime.value || 0),
    flowControlList: inletConfigs.value
  }
  if (flowControlProcesses.value !== undefined) {
    //replace the process base on the index
    flowControlProcesses.value.splice(props.index, 1, newFlowControlProcess)
  }
}

function OnDeleteButtonClick() {
  isCreateNewProcessDialogVisible.value = false
  if (flowControlProcesses.value !== undefined) {
    //replace the process base on the index
    flowControlProcesses.value.splice(props.index, 1)
  }
}
</script>

<template>
  <v-dialog
    v-model="isCreateNewProcessDialogVisible"
    persistent
    width="auto"
    scrollable
    max-height="600px"
  >
    <div class="dialog-div">
      <div class="d-flex pb-2 align-center">
        <p class="text-subtitle-2">{{ isCreateNewProcessMode ? 'Add New Process' : 'Edit Process' }}</p>
        <v-spacer></v-spacer>
        <button class="button mr-2" @click="onCancelButtonClick">Cancel</button>
        <button  class="button mr-2" v-if="!isCreateNewProcessMode" @click="OnDeleteButtonClick">Delete</button>
        <button class="button" @click="onAddOrEditButtonClick()">{{ isCreateNewProcessMode ? 'Add' : 'Edit' }}</button>
      </div>

      <v-divider thickness="2"></v-divider>
      <div class="pb-4"></div>
      <v-row dense>
        <v-col cols="6">
          <v-text-field
            v-model="startTime"
            type="number"
            label="start time"
            variant="outlined"
            density="compact"
            suffix="s"
            color="blue-darken-3"
          >
          </v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="endTime"
            type="number"
            label="end time"
            variant="outlined"
            density="compact"
            suffix="s"
            color="blue-darken-3"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-divider thickness="2"></v-divider>
      <div class="pb-2"></div>
      <div v-for="(inletConfig, idx) in inletConfigs" :key="idx">
        <div class="d-flex pb-2">
          <v-spacer></v-spacer>
          <v-icon
            size="24"
            color="grey-darken-1"
            v-if="inletConfigs.length !== 1"
            @click="onMinusIconClick"
          >
            mdi-trash-can-outline
          </v-icon>
        </div>
        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="inletConfig.inlet"
              variant="outlined"
              density="compact"
              :items="inlets"
              color="blue-darken-3"
              label="inlet"
            >
            </v-select>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="inletConfig.injection"
              variant="outlined"
              density="compact"
              :items="injections"
              color="blue-darken-3"
              label="injection"
            >
            </v-select>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="6">
            <v-select
              v-model="inletConfig.fluid"
              variant="outlined"
              density="compact"
              :items="fluids"
              color="blue-darken-3"
              label="fluid"
              class="custom-v-field"
            >
            </v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="inletConfig.pressure"
              type="number"
              label="Pressure"
              variant="outlined"
              density="compact"
              suffix="Pa"
              color="blue-darken-3"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <div v-if="idx === inletConfigs.length - 1" class="d-flex justify-center align-center">
          <button class="icon-button">
            <v-icon size="20" color="grey-darken-1" @click="onAddIconClick()"> mdi-plus </v-icon>
          </button>
        </div>
        <v-divider v-if="idx !== inletConfigs.length - 1" thickness="2" class="pb-4"></v-divider>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
.dialog-div {
  border-radius: 4px;
  height: fit-content;
  width: 500px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: white;
  overflow-y: auto;
}

.button {
  width: 70px;
  height: fit-content;
  color: #515a6e;
  border-radius: 4px;
  padding: 4px 0px;
  font-size: 14px;
  background-color: #f5f5f5;
}
.button:hover {
  background-color: #d4d4d4;
}

.icon-button {
  width: fit-content;
  height: fit-content;
  color: #515a6e;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  background-color: #f5f5f5;
}
.icon-button:hover {
  background-color: #d4d4d4;
}
</style>
