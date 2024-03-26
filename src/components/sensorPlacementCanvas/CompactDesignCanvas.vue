<template>
  <div class="compact-canvas">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="compactSmallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
        </pattern>
        <pattern id="compactGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect
            width="100%"
            height="100%"
            fill="url(#compactSmallGrid)"
            stroke="#E0E0E0"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" x="0" y="0" fill="url(#compactGrid)" />
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.compact-canvas {
  position: relative;
  width: 50px;
  height: 50px;
  cursor: pointer;
  background-color: #faf9f7;
  border: 1px solid #dfdfdf;
  border-radius: 8px;
  overflow: clip;
}
</style>
