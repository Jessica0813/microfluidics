<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
import type { Operation } from '@/types/operation'

const { findNode } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)

const inlets = ['inlet 1', 'inlet 2', 'inlet 3']
const injections = ref(['droplet', 'Needlenedddke'])
const fluids = ['water', 'oil']

const flowControl = ref<Operation>({
  inlet: '',
  injection: '',
  fluid: '',
  pressure: 0,
  startTime: 0,
  endTime: 0
})

watch(flowControl.value, (newFlowControl) => {
  const node = findNode(id)
  if (node === undefined) {
    return
  }
  node.data.flowControl = newFlowControl
  console.log(node)
})
</script>

<template>
  <div
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
  >
    <!-- <CustomizedHandle 
        :type="'source'"
        :position="Position.Top"
      ></CustomizedHandle> -->
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
    <v-sheet
      class="pa-3 align-center justify-center"
      width="300"
      color="grey-lighten-4"
      :rounded="true"
    >
      <div class="d-flex align-center mb-3">
        <v-icon size="small" class="mr-2" color="grey-darken-3"> mdi-form-select</v-icon>
        <p class="text-subtitle-2">Procedure</p>
      </div>

      <v-row dense>
        <v-col cols="6">
          <v-select
            v-model="flowControl.inlet"
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
            v-model="flowControl.injection"
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
            v-model="flowControl.fluid"
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
            v-model="flowControl.pressure"
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
            v-model="flowControl.startTime"
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
            v-model="flowControl.endTime"
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
.v-input__details {
  display: none !important;
  min-height: 12px !important;
  padding-top: 4px !important;
}
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
  top: -17px;
}

.top-handle {
  height: 0;
  width: 0;
  top: 0;
  opacity: 0;
}

.vue-flow__handle-right {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  right: -17px;
}

.right-handle {
  height: 0;
  width: 0;
  right: 0;
  opacity: 0;
}

.vue-flow__handle-bottom {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  bottom: -17px;
}

.bottom-handle {
  height: 0;
  width: 0;
  bottom: 0;
  opacity: 0;
}

.vue-flow__handle-left {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
  left: -17px;
}

.left-handle {
  height: 0;
  width: 0;
  left: 0;
  opacity: 0;
}
</style>
