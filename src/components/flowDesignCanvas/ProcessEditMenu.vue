<script setup lang="ts">
const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['droplet', 'Needle']
const fluids = ['water', 'oil']

defineProps({
  id: String
})
const name = defineModel<string>('name', { default: '' })
const duration = defineModel('duration', { default: 0 })
const inlet = defineModel<string>('inlet', { default: '' })
const injection = defineModel<string>('injection', { default: '' })
const fluid = defineModel<string>('fluid', { default: '' })
const pressure = defineModel('pressure', { default: 0 })
</script>

<template>
  <v-sheet
    class="pt-4 px-4 align-center justify-center nodrag"
    :rounded="true"
    width="360"
    height="220"
  >
    <div class="d-flex align-center justify-center mb-4">
      <p class="text-subtitle-1">Inlet Configuration</p>
    </div>
    <v-row dense>
      <v-col cols="6">
        <v-text-field
          v-model="name"
          type="string"
          label="name"
          variant="outlined"
          density="compact"
          color="blue-darken-3"
          :hide-details="true"
        >
        </v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="duration"
          type="number"
          label="duration"
          variant="outlined"
          density="compact"
          suffix="s"
          color="blue-darken-3"
          :hide-details="true"
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
          :hide-details="true"
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
          :hide-details="true"
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
          :hide-details="true"
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
          :hide-details="true"
        >
        </v-text-field>
      </v-col>
    </v-row>
  </v-sheet>
</template>
