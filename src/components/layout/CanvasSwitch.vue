<template>
  <div class="tab-bar elevation-1">
    <button
      class="tab-button"
      :style="{
        backgroundColor: isFlowDesignCanvasOpen ? '#515a6e' : '#efeeea',
        color: isFlowDesignCanvasOpen ? 'white' : 'black'
      }"
      @click="$emit('onFlowDesignClick')"
    >
      Flow Design
    </button>
    <button
      class="tab-button"
      :style="{
        backgroundColor: !isFlowDesignCanvasOpen ? '#515a6e' : '#efeeea',
        color: !isFlowDesignCanvasOpen ? 'white' : 'black'
      }"
      @click="$emit('onSensorPlacementClick')"
    >
      Design Canvas
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isFlowDesignCanvasOpen: {
    type: Boolean,
    default: true
  }
})
defineEmits(['onFlowDesignClick', 'onSensorPlacementClick'])
</script>

<style scoped>
.tab-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #dfdfdf;
  font-size: 14px;
  font-weight: 500;
}

.tab-button {
  text-align: center;
  width: 130px;
  height: 32px;
  border-radius: 4px;
  color: white;
}
</style>
