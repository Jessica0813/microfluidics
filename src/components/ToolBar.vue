<script setup lang="ts">
import TableConfigureButton from './TableConfigureButton.vue'
</script>
<template>
  <div class="d-flex gx-2 button-group">
    <label for="upload" class="button">
      <v-icon color="grey-darken-3" size="small">mdi-upload</v-icon>
      <input type="file" id="upload" style="display: none" />
    </label>
    <button class="button">
      <v-icon color="grey-darken-3" size="small">mdi-download</v-icon>
    </button>
    <v-tooltip location="bottom">
      <template v-slot:activator="{ props }">
        <TableConfigureButton v-bind="props" />
      </template>
      <span>Fluid table</span>
    </v-tooltip>
    <v-tooltip location="bottom">
      <template v-slot:activator="{ props }">
        <button class="button" v-bind="props">
          <v-icon size="small" color="grey-darken-3">mdi-waves</v-icon>
        </button>
      </template>
      <span>Chip design</span>
    </v-tooltip>
    <v-tooltip location="bottom">
      <template v-slot:activator="{ props }">
        <button class="button" v-bind="props">
          <v-icon size="small" color="grey-darken-3">mdi-play</v-icon>
        </button>
      </template>
      <span>Run simulation</span>
    </v-tooltip>
  </div>
</template>

<style scoped>
.button-group {
  background-color: #eeeeee;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 2px;
  width: fit-content;
}
.button {
  cursor: pointer;
  padding: 4px 6px;
  width: fit-content;
  text-align: center;
}
.button:hover {
  background-color: #e0e0e0;
}
</style>
