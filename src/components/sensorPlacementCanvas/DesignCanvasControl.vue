<template>
  <div class="vertical-button-group elevation-1">
    <button
      class="icon-button with-right-border"
      :title="
        designCanvasSize === 'small' ? 'Enlarge the design canvas' : 'Reduce the design canvas'
      "
      @click="toggleDesignCanvasSize"
    >
      <v-icon size="small" color="#66615b">{{
        designCanvasSize === 'small' ? 'mdi-plus' : 'mdi-minus'
      }}</v-icon>
    </button>
    <button
      class="icon-button"
      :title="isDesignCanvasVisible ? 'hide the design canvas' : 'show the design canvas'"
      @click="toggleDesignCanvasVisibility"
    >
      <v-icon size="small" color="#66615b">{{
        isDesignCanvasVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
      }}</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { DesignCanvasControl } from '@/types/designCanvasControl'
import { defaultDesignCanvasControl } from '@/types/designCanvasControl'

const {
  isDesignCanvasVisible,
  designCanvasSize,
  toggleDesignCanvasSize,
  toggleDesignCanvasVisibility
} = inject<DesignCanvasControl>('DesignCanvasControl') || defaultDesignCanvasControl
</script>

<style scoped>
.vertical-button-group {
  display: flex;
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
