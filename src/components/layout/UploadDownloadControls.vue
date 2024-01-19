<script setup lang="ts">
import UploadMenu from './UploadMenu.vue'
</script>

<template>
  <div class="d-flex ga-2">
    <div class="d-flex button-group">
      <button class="icon-button with-right-border" title="undo">
        <v-icon size="small" color="#66615b">mdi-undo</v-icon>
      </button>
      <button class="icon-button with-right-border" title="redo">
        <v-icon size="small" color="#66615b">mdi-redo</v-icon>
      </button>
      <button class="icon-button" title="redo">
        <v-icon size="small" color="#66615b">mdi-trash-can-outline</v-icon>
      </button>
    </div>
    <div class="d-flex button-group">
      <v-menu offset="1" z-index="5">
        <template v-slot:activator="{ props }">
          <button class="icon-button with-right-border" v-bind="props">
            <v-icon color="#66615b" size="small">mdi-upload</v-icon>
          </button>
        </template>
        <UploadMenu />
      </v-menu>
      <button class="icon-button">
        <v-icon color="#66615b" size="small">mdi-download</v-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
