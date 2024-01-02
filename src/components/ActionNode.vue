<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const items = ref(['inlet 1', 'inlet 2', 'inlet 3'])
const ways = ref(['droplet', 'Needlenedddke'])
const fluids = ref(['water', 'oil'])
</script>

<template>
  <div>
    <Handle type="source" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
    <Handle type="source" :position="Position.Right" />
    <Handle type="source" :position="Position.Left" />
    <v-sheet
      class="pa-5 align-center justify-center"
      width="300"
      color="grey-lighten-4"
      :rounded="true"
    >
      <div class="d-flex align-center mb-3">
        <v-icon size="24" class="mr-2" color="grey-darken-3"> mdi-cog</v-icon>
        <p class="text-h6">Action</p>
      </div>

      <v-row dense>
        <v-col cols="6">
          <v-select
            variant="outlined"
            density="compact"
            :items="items"
            color="blue-darken-3"
            label="inlet"
            class="custom-v-field"
          >
          </v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            variant="outlined"
            density="compact"
            :items="ways"
            color="blue-darken-3"
            label="ways"
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
            label="fluids"
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
    </v-sheet>
  </div>
</template>

<style>
/* .v-input__details {
    display: none !important;
    min-height: 12px !important;
    padding-top: 4px !important;
} */
.v-input--density-compact .v-field--variant-outlined,
.v-input--density-compact .v-field--single-line,
.v-input--density-compact .v-field--no-label {
  --v-field-padding-bottom: 2px !important;
  --v-field-input-padding-top: 2px !important;
}
.v-input--density-compact {
  --v-input-control-height: 36px !important;
}

.vue-flow__handle-top {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  top: -15px;
}

.vue-flow__handle-right {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  right: -15px;
}

.vue-flow__handle-bottom {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  bottom: -15px;
}

.vue-flow__handle-left {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  left: -15px;
}
</style>
