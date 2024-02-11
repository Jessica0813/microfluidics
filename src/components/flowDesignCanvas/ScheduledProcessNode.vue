<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import RangBarChart from './RangeBarChart.vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import { useVueFlow } from '@vue-flow/core'
import CustomizedNumberInput from './CustomizedNumberInput.vue'

const { selected, id } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const nodeRef = ref<HTMLDivElement | null>(null)

const totalDuration = ref<number>(20)

const { findNode } = useVueFlow()

console.log(findNode(id))
</script>

<template>
  <div
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      height: '100%',
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
    ref="nodeRef"
  >
    <NodeResizer :minWidth="300" :minHeight="150" />
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
    <div style="background-color: #eeeeee; border-radius: 4px; height: 100%">
      <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-chart-gantt</v-icon>
        <p class="text-subtitle-2">
          {{ 'Duration: ' + totalDuration }}
        </p>
        <v-spacer></v-spacer>
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-plus</v-icon>
      </div>

      <v-divider thickness="2" />
      <CustomizedNumberInput />
      <div
        style="
          padding-top: 5px;
          padding-bottom: 20px;
          padding-left: 12px;
          padding-right: 12px;
          height: 76%;
        "
      >
        <RangBarChart :id="id" />
      </div>
    </div>
  </div>
</template>
