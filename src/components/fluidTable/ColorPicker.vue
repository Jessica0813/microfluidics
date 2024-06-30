<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <div class="d-flex align-center">
        <div
          :style="{
            width: '30px',
            height: '15px',
            borderRadius: '2px',
            backgroundColor: colorInput,
            border: colorInput === '' ? '0.5px solid' : 'none'
          }"
        ></div>
        <v-icon class="ml-1" color="grey-darken-3" v-bind="props"> mdi-palette</v-icon>
      </div>
    </template>
    <v-color-picker v-model="colorInput" show-swatches hide-sliders hide-inputs></v-color-picker>
  </v-menu>
</template>

<script setup lang="ts">
const colorInput = defineModel<string>({ default: '' })
</script>
