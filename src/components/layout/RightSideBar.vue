<script setup lang="ts">
import TableConfigureButton from './TableConfigureButton.vue'
</script>

<template>
  <div class="vertical-button-group">
    <TableConfigureButton title="fluid table" />
    <button class="icon-button with-bottom-border" title="DRC">
      <v-icon size="small" color="#66615b">mdi-text-box-check-outline</v-icon>
    </button>
    <button class="icon-button" title="run">
      <v-icon size="small" color="#66615b">mdi-play</v-icon>
    </button>
  </div>
</template>

<style scoped>
.vertical-button-group {
  display: flex;
  flex-direction: column;
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
