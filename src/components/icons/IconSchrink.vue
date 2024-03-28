<script setup lang="ts">
defineProps({
  size: Number
})
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 4V7C15 8.10457 15.8954 9 17 9H20M9 4V7C9 8.10457 8.10457 9 7 9H4M15 20V17C15 15.8954 15.8954 15 17 15H20M9 20V17C9 15.8954 8.10457 15 7 15H4"
      stroke="#66615b"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
