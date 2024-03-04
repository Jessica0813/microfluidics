<script setup lang="ts">
import { ref, watch } from 'vue'
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
import type { FlowControl } from '@/types/flowControl'
import ProcessEditMenu from './ProcessEditMenu.vue'
import { useMenuPositionCalculator } from '@/composables/useMenuPositionCalculator() '
import ProcessEditMenuTest from './ProcessEditMenuTest.vue'

const { updateNodeData } = useVueFlow()
const { id, selected } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)
const isMenuOpen = ref(false)
const targetRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)

const flowControl = ref<FlowControl>({
  name: id,
  inlet: 'inlet 1',
  injection: 'pump',
  fluid: 'water',
  pressure: 0,
  duration: 0,
  flowrate: 0
})

watch(isMenuOpen, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    updateNodeData(id, (node) => {
      if (node.data === undefined || node.data.flowControl !== flowControl.value) {
        node.data.flowControl = flowControl.value
      }
      console.log(node)
    })
  }
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
</script>

<template>
  <div
    ref="targetRef"
    v-click-outside="{
      handler: onClickOutside
    }"
    @click="onTrigger"
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      border: selected || nodeIsHovered || isMenuOpen ? '1px solid rgba(0, 100, 255, 0.7)' : ''
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
      style="width: 300px; height: auto; background-color: #eeeeee; border-radius: 4px"
    >
      <p
        style="font-size: 14px"
        v-if="flowControl.injection === '' || flowControl.injection === 'pump'"
      >
        <strong>{{ flowControl.fluid }}</strong> is injected into
        <strong>{{ flowControl.inlet }}</strong> using
        <strong>{{ flowControl.injection }}</strong> at a pressure of
        <strong>{{ flowControl.pressure }}</strong> for a duration of
        <strong>{{ flowControl.duration }}</strong> seconds
      </p>
      <p style="font-size: 14px" v-else>
        <strong>{{ flowControl.fluid }}</strong> is injected into
        <strong>{{ flowControl.inlet }}</strong> using a
        <strong>{{ flowControl.injection }}</strong> , at a flowrate of
        <strong>{{ flowControl.flowrate }}</strong> for a duration of
        <strong>{{ flowControl.duration }}</strong> seconds
      </p>
      <!-- <div class="d-flex align-center py-2">
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
      </div> -->
      <!-- </div> -->
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
  height: 24px;
  width: 24px;
  background-color: rgba(0, 100, 255, 0.1);
}

.top-handle {
  height: 0;
  width: 0;
  top: 0;
  opacity: 0;
}

.vue-flow__handle-right {
  height: 24px;
  width: 24px;
  background-color: rgba(0, 100, 255, 0.1);
}

.right-handle {
  height: 0;
  width: 0;
  right: 0;
  opacity: 0;
}

.vue-flow__handle-bottom {
  height: 24px;
  width: 24px;
  background-color: rgba(0, 100, 255, 0.1);
}

.bottom-handle {
  height: 0;
  width: 0;
  bottom: 0;
  opacity: 0;
}

.vue-flow__handle-left {
  height: 24px;
  width: 24px;
  background-color: rgba(0, 100, 255, 0.1);
}

.left-handle {
  height: 0;
  width: 0;
  left: 0;
  opacity: 0;
}
</style>
