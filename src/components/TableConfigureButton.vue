<script setup lang="ts">
import CustomizedTable from './CustomizedTable.vue'
import { ref } from 'vue'

const tableDialog = ref(false)

function onButtonClick() {
  tableDialog.value = true
}
</script>

<template>
  <div>
    <button @click="onButtonClick" class="button">
      <v-icon size="small" color="grey-darken-3">mdi-table-cog</v-icon>
    </button>
    <CustomizedTable v-model:isTableVisible="tableDialog" />
  </div>
</template>

<style scoped>
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
