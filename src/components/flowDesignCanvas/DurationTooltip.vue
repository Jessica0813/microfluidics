<template>
  <div>
    <div class="tooltip-container" :style="{ left: `${left}px`, top: `${top}px` }">
      <div class="tooltip-content">
        <!-- Your tooltip content goes here -->
        This is a tooltip
      </div>
      <div class="triangle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const { left, top } = defineProps(['left', 'top'])
</script>

<style scoped>
.tooltip-container {
  position: absolute;
  display: flex;
  flex-direction: column;
}

.tooltip-content {
  background-color: #333;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  position: relative;
  z-index: 1;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #333;
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
}
</style>
