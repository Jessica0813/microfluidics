<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  label: String,
  items: Array as () => string[]
})
const targetRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)

const selected = defineModel<string>('selected', { default: '' })

const selectItem = (item: string) => {
  selected.value = item
  isMenuOpen.value = false
}
const onClickOutside = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div
    style="position: relative"
    v-click-outside="{
      handler: onClickOutside
    }"
  >
    <p class="custom-label">{{ label + ':' }}</p>
    <div
      ref="targetRef"
      class="dropdown-button"
      :style="{ borderColor: isMenuOpen ? '#007bff' : '#515a6e' }"
      @click="isMenuOpen = !isMenuOpen"
    >
      <p>{{ selected }}</p>
      <v-icon
        size="16px"
        color="grey-darken-3"
        :style="{ transform: isMenuOpen ? 'rotate(180deg)' : '' }"
        >mdi-chevron-up</v-icon
      >
    </div>
    <div
      style="
        position: absolute;
        padding: 2px 0px;
        background-color: white;
        border-radius: 4px;
        z-index: 2;
        width: 100%;
      "
      ref="floatingRef"
      v-if="isMenuOpen"
      class="flex flex-column elevation-2"
    >
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
  </div>
</template>

<style scoped>
.custom-label {
  font-size: 12px;
  color: #515a6e;
  margin-bottom: 2px;
}
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
}
.dropdown-item {
  width: 100%;
  padding: 4px;
  font-size: 14px;
}
.dropdown-item:hover {
  background-color: #e0e0e0;
}
</style>
