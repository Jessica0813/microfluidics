<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const items = ref(['sensor 1', 'sensor 2', 'sensor 3'])
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
        <v-icon size="24" style="transform: rotate(180deg)" class="mr-2" color="grey-darken-3">
          mdi-call-split</v-icon
        >
        <p class="text-h6">Condition</p>
      </div>

      <v-row dense>
        <v-col cols="12">
          <v-select
            variant="outlined"
            density="compact"
            :items="items"
            color="blue-darken-3"
            label="sensor"
            class="custom-v-field"
          >
          </v-select>
        </v-col>
      </v-row>
    </v-sheet>
  </div>
</template>
