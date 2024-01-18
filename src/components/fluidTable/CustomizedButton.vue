<script setup lang="ts">
defineEmits(['onClick'])
defineProps({
  isCancelAction: {
    type: Boolean,
    default: false
  },
  buttonName: String
})
</script>

<template>
  <v-btn
    class="text-white"
    :color="isCancelAction ? 'grey-darken-3' : 'blue-darken-2'"
    flat
    rounded="md"
    @click="$emit('onClick')"
    >{{ buttonName }}</v-btn
  >
</template>
