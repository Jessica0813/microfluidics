<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
import type { Operation } from '@/types/operation'
import ProcessEditMenu from './ProcessEditMenu.vue'

const { findNode } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const isMenuOpen = ref(false)

const flowControl = ref<Operation>({
  inlet: 'inlet 1',
  injection: 'droplet',
  fluid: 'water',
  pressure: 3000,
  startTime: 0,
  endTime: 20
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
        selected || nodeIsHovered || isMenuOpen
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
  >
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
    <div
      class="flex align-center justify-center"
      style="width: 280px; height: auto; background-color: #f5f5f5; border-radius: 4px"
    >
      <div class="d-flex align-center pt-3 pb-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-form-select</v-icon>
        <p class="text-subtitle-2">{{  "Time period: " + flowControl.startTime + " - " + flowControl.endTime + "s" }}</p>
        <v-spacer></v-spacer>
        <div>
          <ProcessEditMenu  v-model="isMenuOpen"/>
        </div>
      </div>
      <v-divider thickness="2" />
      <div class="flex pa-3">
          <v-chip class="mr-1 mb-2">{{ 'inlet: ' + flowControl.inlet }}</v-chip>
          <v-chip class="mr-1 mb-2">{{ 'fluid: ' + flowControl.fluid }}</v-chip>
          <v-chip class="mr-1 mb-2">{{ 'pressure:' + flowControl.pressure }}</v-chip>
          <v-chip class="mr-1 mb-2">{{ 'injection: ' + flowControl.injection }}</v-chip>
      </div>
    </div>
  </div>
</template>

<style>
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
