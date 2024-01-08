<script setup lang="ts">
const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['droplet', 'Needle']
const fluids = ['water', 'oil']

defineProps({
  id: String
})
const menu = defineModel<boolean>('menu', { default: false })
const startTime = defineModel('startTime', { default: 0 })
const endTime = defineModel('endTime', { default: 0 })
const inlet = defineModel<string>('inlet', { default: '' })
const injection = defineModel<string>('injection', { default: '' })
const fluid = defineModel<string>('fluid', { default: '' })
const pressure = defineModel('pressure', { default: 0 })
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="end">
    <template v-slot:activator="{ props }">
      <v-icon size="small" color="grey-darken-3" v-bind="props"> mdi-dots-vertical</v-icon>
    </template>
    <v-sheet
      class="pt-4 px-4 align-center justify-center"
      :rounded="true"
      color="grey-lighten-4"
      width="360"
      height="270"
    >
      <div class="d-flex align-center justify-center mb-4">
        <p class="text-subtitle-1">Inlet Configuration</p>
      </div>
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
      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="inlet"
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
            v-model="injection"
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
            v-model="fluid"
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
            v-model="pressure"
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
    </v-sheet>
  </v-menu>
</template>
