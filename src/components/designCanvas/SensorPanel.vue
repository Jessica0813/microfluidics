<template>
  <div class="panel text-center flex-column elevation-1">
    <v-menu offset="3" v-model="isPanelMenuOpen" :location="'end center'">
      <template v-slot:activator="{ props }">
        <button class="icon-padding" v-bind="props" v-tippy="{ content: 'Sensor' }">
          <v-icon size="small" color="#515a6e"> mdi-circle-outline </v-icon>
        </button>
      </template>
      <div class="dropdown-menu">
        <div
          class="dropdown-item"
          v-for="(type, index) in sensorTypes"
          :key="index"
          v-tippy="{ content: type + ' sensor' }"
        >
          <v-icon
            size="large"
            :color="type === 'temperature' ? '#CFD8DC' : type === 'color' ? '#B0BEC5' : '#90A4AE'"
            :draggable="true"
            @dragstart="onDragStart($event, type)"
            >mdi-circle</v-icon
          >
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { SensorType } from '@/types/sensor'
const isPanelMenuOpen = defineModel<boolean>('isPanelMenuOpen', { default: false })
const sensorTypes = [SensorType.Temperature, SensorType.Viscosity, SensorType.Color]

function onDragStart(event: DragEvent, sensorType: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/desgin', sensorType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<style scoped>
.panel {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 2px;
}
.icon-padding {
  padding: 0px 2px;
}
.icon-padding:hover {
  background-color: #e0e0e0;
}

.dropdown-item {
  display: flex;
  width: 100%;
  padding: 2px 4px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.dropdown-item:hover {
  background-color: #e0e0e0;
}

.dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 4px 0px;
  background-color: white;
  border-radius: 4px;
  width: fit-content;
  border: 0.5px solid lightgray;
}

.circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: grey;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
</style>
