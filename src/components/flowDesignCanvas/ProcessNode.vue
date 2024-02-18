<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
import type { FlowControl } from '@/types/flowControl'
import ProcessEditMenu from './ProcessEditMenu.vue'
import { flip, shift, computePosition, offset } from '@floating-ui/vue'

const { updateNodeData } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const isMenuOpen = ref(false)
const targetRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)

const flowControl = ref<FlowControl>({
  name: id,
  inlet: 'inlet 1',
  injection: 'Pump',
  fluid: 'water',
  pressure: 0,
  duration: 0,
  flowrate: 0
})

watch(isMenuOpen, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    updateNodeData(id, (node) => {
      node.data.flowControl = flowControl.value
      console.log(node)
    })
  }
})

function calculatePosition() {
  if (!targetRef.value || !floatingRef.value) {
    return
  }

  try {
    computePosition(targetRef.value, floatingRef.value, {
      placement: 'right',
      middleware: [offset(5), flip(), shift()]
    }).then((pos) => {
      Object.assign(floatingRef.value!.style, {
        left: `${pos.x}px`,
        top: `${pos.y}px`
      })
      console.log('pos:', pos)
    })
  } catch (error) {
    console.error('Error calculating position:', error)
  }
}

function onTrigger() {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    calculatePosition()
  }
}

function onClickOutside() {
  isMenuOpen.value = false
}
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
      class="flex align-center justify-center"
      style="width: 300px; height: auto; background-color: #eeeeee; border-radius: 4px"
    >
      <div class="d-flex align-center py-2">
        <v-icon size="small" class="mx-2" color="grey-darken-3"> mdi-form-select</v-icon>
        <p class="text-body-2">
          {{ flowControl.name }}
        </p>
        <v-spacer></v-spacer>
        <div @click="onTrigger">
          <v-icon size="small" color="grey-darken-3"> mdi-dots-vertical</v-icon>
        </div>
      </div>
      <v-divider thickness="2" />
      <div class="flex px-3 pt-3 pb-1">
        <v-chip class="mr-1 mb-2" size="small">{{
          'duration: ' + flowControl.duration + 's'
        }}</v-chip>
        <v-chip class="mr-1 mb-2" size="small">{{ 'inlet: ' + flowControl.inlet }}</v-chip>
        <v-chip class="mr-1 mb-2" size="small">{{ 'fluid: ' + flowControl.fluid }}</v-chip>
        <v-chip class="mr-1 mb-2" size="small">{{ 'pressure:' + flowControl.pressure }}</v-chip>
        <v-chip class="mr-1 mb-2" size="small">{{ 'injection: ' + flowControl.injection }}</v-chip>
      </div>
    </div>
    <div ref="floatingRef" style="position: absolute; z-index: 1000" v-show="isMenuOpen">
      <ProcessEditMenu
        v-model:name="flowControl.name"
        v-model:menu="isMenuOpen"
        v-model:duration="flowControl.duration"
        v-model:inlet="flowControl.inlet"
        v-model:fluid="flowControl.fluid"
        v-model:pressure="flowControl.pressure"
        v-model:injection="flowControl.injection"
        v-model:flowrate="flowControl.flowrate"
        :id="id"
      />
    </div>
  </div>
</template>

<style>
.vue-flow__handle-top {
  height: 30px;
  width: 30px;
  background-color: rgba(0, 100, 255, 0.1);
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
}

.left-handle {
  height: 0;
  width: 0;
  left: 0;
  opacity: 0;
}
</style>
