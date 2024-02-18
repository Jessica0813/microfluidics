<script setup lang="ts">
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import { watch } from 'vue'

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['Pump', 'Needle']
const fluids = ['water', 'oil']

defineProps({
  id: String,
  isEditingProcess: Boolean
})

const nodeName = defineModel<string>('nodeName', { default: '' })
const totalDuration = defineModel<number>('totalDuration', { default: 0 })
const processName = defineModel<string>('processName', { default: '' })
const startTime = defineModel<number>('startTime', { default: 0 })
const endTime = defineModel<number>('endTime', { default: 0 })
const inlet = defineModel<string>('inlet', { default: '' })
const injection = defineModel<string>('injection', { default: '' })
const fluid = defineModel<string>('fluid', { default: '' })
const pressure = defineModel<number>('pressure', { default: 0 })
const flowrate = defineModel<number>('flowrate', { default: 0 })

watch(injection, (newInjection, oldInjection) => {
  if (newInjection !== oldInjection) {
    if (newInjection === 'Pump' || newInjection === '') {
      pressure.value = 0
    } else if (newInjection === 'Needle') {
      flowrate.value = 0
    }
  }
})
</script>

<template>
  <v-sheet
    class="py-4 px-4 align-center justify-center nodrag"
    :rounded="true"
    width="360"
    height="auto"
  >
    <div v-if="!isEditingProcess">
      <v-row dense>
        <v-col cols="12">
          <CustomizedTextInput v-model:text="nodeName" label="Name" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12">
          <CustomizedNumberInput v-model:number="totalDuration" label="Total Duration" />
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row dense>
        <v-col cols="12">
          <CustomizedTextInput v-model:text="processName" label="Name" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <CustomizedNumberInput v-model:number="startTime" label="Start Time" />
        </v-col>
        <v-col cols="6">
          <CustomizedNumberInput v-model:number="endTime" label="end Time" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="6">
          <CustomizedDropdown v-model:selected="inlet" :items="inlets" label="Inlet" />
        </v-col>
        <v-col cols="6">
          <CustomizedDropdown v-model:selected="fluid" :items="fluids" label="Fluid" />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="6">
          <CustomizedDropdown v-model:selected="injection" :items="injections" label="Injection" />
        </v-col>
        <v-col cols="6" v-if="injection === '' || injection === 'Pump'">
          <CustomizedNumberInput v-model:number="pressure" label="Pressure" />
        </v-col>
        <v-col cols="6" v-else-if="injection === 'Needle'">
          <CustomizedNumberInput v-model:number="flowrate" label="Flow rate" />
        </v-col>
      </v-row>
    </div>
  </v-sheet>
</template>
