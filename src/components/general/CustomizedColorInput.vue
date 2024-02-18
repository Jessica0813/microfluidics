<template>
  <p class="custom-label">{{ label + ':' }}</p>
  <input type="color" v-model="color" class="custom-input" />
</template>

<script setup lang="ts">
defineProps({
  label: String
})
const color = defineModel<string>('color', { default: '' })
</script>
