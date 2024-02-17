<script setup lang="ts">
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['droplet', 'Needle']
const fluids = ['water', 'oil']

defineProps({
  id: String
})
const name = defineModel<string>('name', { default: '' })
const duration = defineModel<number>('duration', { default: 0 })
const inlet = defineModel<string>('inlet', { default: '' })
const injection = defineModel<string>('injection', { default: '' })
const fluid = defineModel<string>('fluid', { default: '' })
const pressure = defineModel<number>('pressure', { default: 0 })
</script>

<template>
  <v-sheet
    class="py-4 px-4 align-center justify-center nodrag"
    :rounded="true"
    width="360"
    height="auto"
  >
    <v-row dense>
      <v-col cols="6">
        <CustomizedTextInput v-model:text="name" label="Name" />
      </v-col>
      <v-col cols="6">
        <CustomizedNumberInput v-model:number="duration" label="Duration" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="6">
        <CustomizedDropdown v-model:selected="inlet" :items="inlets" label="Inlet" />
      </v-col>
      <v-col cols="6">
        <CustomizedDropdown v-model:selected="injection" :items="injections" label="Injection" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <CustomizedDropdown v-model:selected="fluid" :items="fluids" label="Fluid" />
      </v-col>
      <v-col cols="6">
        <CustomizedNumberInput v-model:number="pressure" label="Pressure" />
      </v-col>
    </v-row>
  </v-sheet>
</template>
