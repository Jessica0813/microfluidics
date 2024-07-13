<template>
  <div class="dropdown-menu">
    <button class="dropdown-item" v-if="items.length === 0">No fluids availables</button>
    <button
      class="dropdown-item"
      v-for="(item, index) in items"
      :style="{ color: selected === item ? '#007bff' : '' }"
      :key="index"
      @click="selectItem(item)"
    >
      {{ item.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { type Fluid } from '@/types/fluid'

defineProps<{
  items: Fluid[]
}>()

const selected = defineModel<Fluid | null>('selected', { default: null })

const selectItem = (item: Fluid) => {
  selected.value = item
}
</script>

<style scoped>
.dropdown-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 2px 4px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  white-space: nowrap;
  margin-right: 8px;
}
.dropdown-item {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 2px;
}
.dropdown-item:hover {
  background-color: #eeeeee;
}

.dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 4px;
  background-color: white;
  border-radius: 4px;
  width: fit-content;
  border: 0.5px solid lightgray;
}
</style>
