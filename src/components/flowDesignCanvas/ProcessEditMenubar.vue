<template>
  <div class="bar">
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-clock-outline</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-waves</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-location-enter</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-selection-ellipse-arrow-inside</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-speedometer</v-icon>
    </button>
    <button class="customized-button">
      <v-icon size="small" color="#66615b">mdi-car-brake-low-pressure</v-icon>
    </button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 6px;
  background-color: white;
  width: fit-content;
  height: fit-content;
  border-radius: 8px;
}
.customized-button {
  display: flex;
  padding: 6px;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
}
.customized-button:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
