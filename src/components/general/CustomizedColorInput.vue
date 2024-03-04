<template>
  <p class="custom-label" v-if="label !== undefined">{{ label + ':' }}</p>
  <input type="color" v-model="color" class="custom-input" style="min-width: 50px" />
</template>

<script setup lang="ts">
defineProps({
  label: String
})
const color = defineModel<string>('color', { default: '' })
</script>
