<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import type { Condition } from '@/types/condition'
import { useVueFlow } from '@vue-flow/core'

const { findNode } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const isMenuOpen = ref<boolean>(false)
const nodeIsHovered = ref<boolean>(false)
const condition = ref<Condition>({
  name: id,
  sensor: 'color sensor',
  operator: '=',
  color: '#FFFFFF',
  viscosity: 0
})

watch(isMenuOpen, (newValue, oldValue) => {
  if (newValue === false && oldValue === true) {
    const node = findNode(id)
    if (node === undefined) {
      return
    }
    if (node.data === undefined || node.data.condition !== condition.value) {
      node.data.condition = condition.value
    }
    console.log(node)
  }
})
</script>

<template>
  <div
    :id="id"
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      boxShadow:
        selected || nodeIsHovered
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
      class="flex align-center justify-center pa-3"
      style="
        min-width: 100px;
        max-width: 300px;
        width: fit-content;
        height: auto;
        background-color: #eeeeee;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
      "
    >
      <p
        style="font-size: 14px"
        v-if="condition.sensor === 'color sensor' || condition.sensor === ''"
      >
        color <strong> {{ condition.operator }}</strong> {{ condition.color }}?
      </p>
      <p style="font-size: 14px" v-if="condition.sensor === 'viscosity sensor'">
        viscosity <strong> {{ condition.operator }}</strong> {{ condition.viscosity }}?
      </p>
    </div>
  </div>
</template>
