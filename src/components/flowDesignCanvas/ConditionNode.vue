<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import type { Condition } from '@/types/condition'
import { useVueFlow } from '@vue-flow/core'
import ConditionEditMenu from './ConditionEditMenu.vue'
import { useMenuPositionCalculator } from '@/composables/useMenuPositionCalculator() '
import CustomizedNumberInput from '../general/CustomizedNumberInput.vue'
import CustomizedTextInput from '../general/CustomizedTextInput.vue'
import CustomizedDropdown from '../general/CustomizedDropdown.vue'
import CustomizedColorInput from '../general/CustomizedColorInput.vue'

const { findNode } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const isMenuOpen = ref<boolean>(false)
const nodeIsHovered = ref<boolean>(false)
const targetRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const condition = ref<Condition>({
  name: id,
  sensor: 'color sensor',
  operator: '=',
  color: '#FFFFFF',
  viscosity: 0
})

function onTrigger() {
  isMenuOpen.value = true
  if (isMenuOpen.value) {
    useMenuPositionCalculator(targetRef, floatingRef)
  }
}

function onClickOutside() {
  isMenuOpen.value = false
}

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

const dynamicOperators = computed(() => {
  // Get the selected sensor
  const selectedSensor = condition.value.sensor

  if (selectedSensor === 'color sensor' || selectedSensor === undefined) {
    return ['=', '!=']
  } else if (selectedSensor === 'viscosity sensor') {
    return ['>', '<', '=', '!=', '>=', '<=']
  } else {
    return []
  }
})

const items = ['color sensor', 'viscosity sensor']
</script>

<template>
  <div
    ref="targetRef"
    v-click-outside="{
      handler: onClickOutside
    }"
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
      @click="onTrigger"
    >
      <!-- <p
        style="font-size: 14px"
        v-if="condition.sensor === 'color sensor' || condition.sensor === ''"
      >
        color <strong> {{ condition.operator }}</strong> {{ condition.color }}?
      </p>
      <p style="font-size: 14px" v-if="condition.sensor === 'viscosity sensor'">
        viscosity <strong> {{ condition.operator }}</strong> {{ condition.viscosity }}?
      </p> -->
      <CustomizedDropdown v-model:selected="condition.sensor" :items="items" class="mr-2" />
      <CustomizedDropdown
        v-model:selected="condition.operator"
        :items="dynamicOperators"
        class="mr-2"
      />
      <CustomizedColorInput
        v-if="condition.sensor === '' || condition.sensor === 'color sensor'"
        v-model:color="condition.color"
      />
      <CustomizedNumberInput
        v-else-if="condition.sensor === 'viscosity sensor'"
        v-model:number="condition.viscosity"
      />
      <!-- <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" style="transform: rotate(180deg)" color="grey-darken-3">
          mdi-call-split</v-icon
        >
        <p class="text-subtitle-2">
          {{ condition.name }}
        </p>
        <v-spacer></v-spacer>
        <div @click="onTrigger">
          <v-icon size="small" color="grey-darken-3"> mdi-dots-vertical</v-icon>
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
      </div> -->
    </div>
    <!-- <div ref="floatingRef" style="position: absolute; z-index: 1000" v-show="isMenuOpen">
      <ConditionEditMenu
        v-model:name="condition.name"
        v-model:sensor="condition.sensor"
        v-model:operator="condition.operator"
        v-model:viscosity="condition.viscosity"
        v-model:color="condition.color"
        :id="id"
      />
    </div> -->
  </div>
</template>
