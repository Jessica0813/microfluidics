<template>
  <div class="dropdown-menu">
    <button
      class="dropdown-item"
      v-for="(item, index) in items"
      :style="{ color: selected === item ? '#007bff' : '' }"
      :key="index"
      @click="selectItem(item)"
    >
      {{ item }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: String,
  items: Array as () => string[]
})

const selected = defineModel<string>('selected', { default: '' })

const selectItem = (item: string) => {
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
  padding: 8px 12px;
  font-size: 14px;
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
</style>
