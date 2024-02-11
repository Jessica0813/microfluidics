<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import type { Condition } from '@/types/condition'
import { useVueFlow } from '@vue-flow/core'
import ConditionEditMenu from './ConditionEditMenu.vue'

const { findNode } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const isMenuOpen = ref<boolean>(false)
const nodeIsHovered = ref<boolean>(false)
const condition = ref<Condition>({
  name: 'condition',
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
    node.data.condition = condition.value
    console.log(node)
  }
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
      style="width: 300px; height: auto; background-color: #eeeeee; border-radius: 4px"
    >
      <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" style="transform: rotate(180deg)" color="grey-darken-3">
          mdi-call-split</v-icon
        >
        <p class="text-subtitle-2">
          {{ condition.name }}
        </p>
        <v-spacer></v-spacer>
        <div>
          <ConditionEditMenu
            :id="id"
            v-model:name="condition.name"
            v-model:menu="isMenuOpen"
            v-model:sensor="condition.sensor"
            v-model:operator="condition.operator"
            v-model:color="condition.color"
            v-model:viscosity="condition.viscosity"
          />
        </div>
      </div>
      <v-divider thickness="2" />
      <div class="flex px-3 pt-3 pb-1">
        <v-chip
          class="mr-1 mb-2"
          size="small"
          v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
          >{{ 'color ' + condition.operator + ' ' + condition.color }}</v-chip
        >
        <v-chip class="mr-1 mb-2" v-else-if="condition.sensor === 'viscosity sensor'">{{
          'viscosity ' + condition.operator + ' ' + condition.viscosity
        }}</v-chip>
      </div>
    </div>
  </div>
</template>
