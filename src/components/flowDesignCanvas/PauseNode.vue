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
      :id="id + '-top-handle'"
      :position="Position.Top"
      :class="selected || nodeIsHovered ? '' : 'top-handle'"
    />
    <Handle
      :id="id + '-bottom-handle'"
      type="source"
      :position="Position.Bottom"
      :class="selected || nodeIsHovered ? '' : 'bottom-handle'"
    />
    <Handle
      :id="id + '-right-handle'"
      type="source"
      :position="Position.Right"
      :class="selected || nodeIsHovered ? '' : 'right-handle'"
    />
    <Handle
      :id="id + '-left-handle'"
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
      <p style="font-size: 14px">
        pause for <strong> {{ pause.duration }}</strong
        >s
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const { id, selected, data } = defineProps<NodeProps>()

const nodeIsHovered = ref<boolean>(false)

const pause = computed(() => {
  if (data === undefined || data.pause === undefined) {
    return {
      duration: 0
    }
  }
  return data.pause
})
</script>
