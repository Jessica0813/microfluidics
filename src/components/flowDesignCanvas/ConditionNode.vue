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
      :id="id + '-top-handle'"
      type="source"
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
      <div
        v-if="condition.sensor === undefined || condition.sensor.type === SensorType.Color"
        class="wrap"
      >
        <p>
          {{ condition.sensor === undefined ? 'color' : condition.sensor.name
          }}<strong> {{ ' ' + condition.operator }}</strong>
        </p>
        <div class="color-square" :style="{ backgroundColor: condition.color }"></div>
        <p>?</p>
      </div>
      <p style="font-size: 14px" v-else>
        {{ condition.sensor.name }} <strong> {{ ' ' + condition.operator }}</strong>
        {{ condition.measurement }}?
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { SensorType } from '@/types/sensor'

const { id, selected, data } = defineProps<NodeProps>()

const nodeIsHovered = ref<boolean>(false)

const condition = computed(() => {
  if (data === undefined || data.condition === undefined) {
    return {
      name: 'xxx',
      sensor: undefined,
      operator: '=',
      color: '#ffffff',
      measurement: 0
    }
  }
  return data.condition
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
