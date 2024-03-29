<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Handle, Position, useVueFlow, type NodeProps } from '@vue-flow/core'
// import type { FlowControl } from '@/types/flowControl'

// const { updateNodeData } = useVueFlow()
const { id, selected, data } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)

// const flowControl = ref<FlowControl>({
//   inlet: 'inlet 1',
//   injection: 'pump',
//   fluid: 'water',
//   pressure: 0,
//   duration: 0,
//   flowrate: 0
// })

const flowControl = computed(() => {
  if (data === undefined || data.flowControl === undefined) {
    return {
      inlet: 'inlet 1',
      injection: 'pump',
      fluid: 'water',
      pressure: 0,
      duration: 0,
      flowrate: 0
    }
  }
  return data.flowControl
})

// watch(isMenuOpen, (newValue, oldValue) => {
//   if (!newValue && oldValue) {
//     updateNodeData(id, (node) => {
//       if (node.data === undefined || node.data.flowControl !== flowControl.value) {
//         node.data.flowControl = flowControl.value
//       }
//       console.log(node)
//     })
//   }
// })
</script>

<template>
  <div
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :id="id"
    :style="{
      border: selected || nodeIsHovered ? '1px solid rgba(0, 100, 255, 0.7)' : ''
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
        width: 300px;
        height: auto;
        background-color: #eeeeee;
        border-radius: 4px;
        font-size: 14px;
      "
    >
      <p v-if="flowControl.injection === '' || flowControl.injection === 'pump'">
        <strong>{{ flowControl.injection + ' ' }}</strong>
        <strong>{{ flowControl.fluid }}</strong> into <strong>{{ flowControl.inlet }}</strong> at
        <strong>{{ flowControl.pressure }}</strong> pressure for
        <strong>{{ flowControl.duration }}</strong
        >s
      </p>
      <p v-else>
        <strong>{{ flowControl.injection + ' ' }}</strong>
        <strong>{{ flowControl.fluid }}</strong> into <strong>{{ flowControl.inlet }}</strong> at a
        rate of <strong>{{ flowControl.flowrate }}</strong> for
        <strong>{{ flowControl.duration }}</strong
        >s
      </p>
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
