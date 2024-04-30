<template>
  <div class="d-flex ga-2">
    <div class="d-flex button-group ml-2">
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

<script setup lang="ts">
import UploadMenu from './UploadMenu.vue'
</script>

<style scoped>
.button-group {
  background-color: #efeeea;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  width: fit-content;
}
</style>
