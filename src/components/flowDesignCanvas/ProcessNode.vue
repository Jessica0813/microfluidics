<template>
  <div
    class="new-node"
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :id="id"
    :style="{
      border: selected || nodeIsHovered ? '1px solid rgba(0, 100, 255, 0.7)' : ''
    }"
  >
    <Handle
      :id="id + '-top-handle'"
      type="source"
      :position="Position.Top"
      :class="selected || nodeIsHovered ? '' : 'top-handle'"
      v-if="!isOverScheduleNode"
    />
    <Handle
      :id="id + '-bottom-handle'"
      type="source"
      :position="Position.Bottom"
      :class="selected || nodeIsHovered ? '' : 'bottom-handle'"
      v-if="!isOverScheduleNode"
    />
    <Handle
      :id="id + '-right-handle'"
      type="source"
      :position="Position.Right"
      :class="selected || nodeIsHovered ? '' : 'right-handle'"
      v-if="!isOverScheduleNode"
    />
    <Handle
      :id="id + '-left-handle'"
      type="source"
      :position="Position.Left"
      :class="selected || nodeIsHovered ? '' : 'left-handle'"
      v-if="!isOverScheduleNode"
    />
    <div
      v-if="!isOverScheduleNode"
      class="flex align-center justify-center pa-3"
      style="
        width: 300px;
        height: auto;
        background-color: #eeeeee;
        border-radius: 4px;
        font-size: 14px;
      "
    >
      <span v-if="flowControl.injection === '' || flowControl.injection === 'pump'">
        Inject
        <strong>{{ flowControl.fluid ? flowControl.fluid.name : 'fluid' }}</strong> into
        <strong>{{ flowControl.inlet }}</strong> with a
        <strong>{{ flowControl.injection + ' ' }}</strong> at
        <strong>{{ flowControl.pressure }}</strong> psi for
        <strong>{{ flowControl.duration }}</strong
        >s,
      </span>
      <span v-else>
        Inject
        <strong>{{ flowControl.fluid ? flowControl.fluid.name : 'fluid' }}</strong> into
        <strong>{{ flowControl.inlet }}</strong> with a
        <strong>{{ flowControl.injection + ' ' }}</strong> at
        <strong>{{ flowControl.flowrate }}</strong> µL/min for
        <strong>{{ flowControl.duration }}</strong
        >s,
      </span>
      <span v-if="flowControl.inletState === 'connect'">
        then connect <strong>{{ flowControl.inlet }}</strong> to air
      </span>
      <span v-else>
        then block <strong>{{ flowControl.inlet }}</strong> from air
      </span>
    </div>
    <div
      v-else
      :style="{
        width: '100px',
        height: '20px',
        backgroundColor: '#bdbdbd'
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const { id, selected, data } = defineProps<NodeProps>()

const nodeIsHovered = ref(false)

const isOverScheduleNode = computed(() => {
  if (data === undefined || data.isOverScheduleNode === undefined) {
    return false
  }
  return data.isOverScheduleNode
})

const flowControl = computed(() => {
  if (data === undefined || data.flowControl === undefined) {
    return {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: 'water',
      pressure: 0,
      duration: 0,
      flowrate: 0,
      inletState: 'connect'
    }
  }
  return data.flowControl
})

watch(isOverScheduleNode, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    //get the mouse position
  }
})
</script>

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

.new-node {
  animation: fadeIn 0.8s ease;
}
</style>
