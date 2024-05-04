<template>
  <div
    class="new-node"
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
      <div v-if="condition.sensor === 'color sensor' || condition.sensor === ''" class="wrap">
        <p>
          color <strong> {{ condition.operator }}</strong>
        </p>
        <div class="color-square" :style="{ backgroundColor: condition.color }"></div>
        <p>?</p>
      </div>
      <p style="font-size: 14px" v-if="condition.sensor === 'viscosity sensor'">
        viscosity <strong> {{ condition.operator }}</strong> {{ condition.viscosity }}?
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'

const { findNode } = useVueFlow()
const { id, selected, data } = defineProps<NodeProps>()
const isMenuOpen = ref<boolean>(false)
const nodeIsHovered = ref<boolean>(false)

const condition = computed(() => {
  if (data === undefined || data.condition === undefined) {
    return {
      name: 'xxx',
      sensor: 'color sensor',
      operator: '=',
      color: '#ffffff',
      viscosity: 0
    }
  }
  return data.condition
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

<style scoped>
.wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
}
.color-square {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-left: 4px;
  margin-right: 4px;
}
</style>
