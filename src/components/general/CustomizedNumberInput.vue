<template>
  <p class="custom-label" v-if="label !== undefined">{{ label + ':' }}</p>
  <input type="number" v-model="number" :min="min" :max="max" class="custom-input nodrag" />
</template>

<script setup lang="ts">
defineProps({
  label: String,
  min: {
    type: Number,
    default: 0
  },
  max: Number
})
const number = defineModel('number', { default: 0 })
</script>
