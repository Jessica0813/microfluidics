<template>
  <SmoothStepEdge
    v-bind="props"
    :id="id"
    :label="label"
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition"
    :target-position="targetPosition"
    :marker-end="markerEnd"
    :style="{ stroke: '757575', strokeWidth: 2 }"
  />
</template>

<script setup lang="ts">
import { SmoothStepEdge, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()
</script>
