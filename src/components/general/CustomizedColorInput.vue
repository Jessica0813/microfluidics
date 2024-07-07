<template>
  <input type="color" v-model="color" class="color-input" />
</template>

<script setup lang="ts">
const color = defineModel<string>('color', { default: '#000000' })
</script>

<style>
.color-input {
  width: 32px !important;
  height: 32px;
  padding: 6px;
  border-radius: 4px;
  margin-left: 4px;
}
.color-input:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
