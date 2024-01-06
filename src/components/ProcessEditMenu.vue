<script setup lang="ts">
const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ['droplet', 'Needlenedddke']
const fluids = ['water', 'oil']

const menu = defineModel<boolean>({ default: false })
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="end">
    <template v-slot:activator="{ props }">
      <v-icon color="grey-darken-3" v-bind="props"> mdi-dots-vertical</v-icon>
    </template>
    <v-sheet
      class="pt-4 px-4 align-center justify-center"
      :rounded="true"
       width="360"
       height="270"
    >
      <div class="d-flex align-center justify-center mb-4">
        <p class="text-subtitle-1">Inlet Configuration</p>
      </div>
      <v-row dense>
        <v-col cols="6">
          <v-text-field
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
