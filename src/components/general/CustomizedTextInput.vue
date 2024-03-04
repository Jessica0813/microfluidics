<template>
  <p class="custom-label" v-if="label !== undefined">{{ label + ':' }}</p>
  <input type="text" v-model="text" class="custom-input" />
</template>

<script setup lang="ts">
defineProps({
  label: String
})
const text = defineModel<string>('text', { default: '' })
</script>
