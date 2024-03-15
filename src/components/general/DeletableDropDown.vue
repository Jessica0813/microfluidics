<script setup lang="ts">
import { ref } from 'vue'

defineProps({
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

const removeSelectedItem = () => {
  selected.value = ''
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
    <div
      ref="targetRef"
      class="dropdown-button"
      :style="{ backgroundColor: isMenuOpen ? '#d4d4d4' : '' }"
      @click="isMenuOpen = !isMenuOpen"
    >
      <div style="text-align: center; width: 90%">
        <p>{{ selected === '' ? 'please select a layer' : selected }}</p>
      </div>
      <v-icon
        size="16px"
        color="grey-darken-3"
        :style="{ transform: isMenuOpen ? 'rotate(180deg)' : '' }"
        >mdi-chevron-down</v-icon
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
        top: -400%;
      "
      ref="floatingRef"
      v-if="isMenuOpen"
      class="flex flex-column elevation-2"
    >
      <button class="dropdown-item" @click="removeSelectedItem">remove</button>
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
.dropdown-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 180px;
  padding: 2px 4px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  border-right: 1px solid #dfdfdf;
}
.dropdown-button:hover {
  background-color: #d4d4d4;
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
