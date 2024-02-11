<template>
  <p class="custom-label">{{ label + ':' }}</p>
  <input type="text" v-model="text" class="custom-input" />
</template>

<script setup lang="ts">
defineProps({
  label: String
})
const text = defineModel<string>('text', { default: '' })
</script>

<style scoped>
.custom-label {
  font-size: 12px;
  color: #515a6e;
  margin-bottom: 2px;
}
.custom-input {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid #515a6e;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.custom-input:focus {
  border-color: #007bff;
}
</style>
