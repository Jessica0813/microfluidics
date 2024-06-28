<template>
  <div class="input-wrapper">
    <div>
      <input type="text" v-model="text" class="validation-input" @input="onInput" />
      <!-- <v-icon size="small" :color="'red-lighten-1'">mdi-close</v-icon> -->
      <!-- <v-icon size="small" :color="'green-lighten-1'" style="margin-left: 4px">mdi-check</v-icon> -->
    </div>
    <p v-if="!isValid" class="error-text">The name has existed</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isValid: boolean
}>()
const text = defineModel<string>('text', { default: '' })

const emit = defineEmits(['input'])

const onInput = () => {
  emit('input', text.value)
}
</script>

<style>
.input-wrapper {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border: 1px solid lightgrey;
  border-radius: 4px;
  background-color: white;
}

.validation-input {
  border-bottom: 0.5px solid lightgrey;
  font-size: 14px;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.error-text {
  font-size: 8px;
  color: #e53935;
}
</style>
