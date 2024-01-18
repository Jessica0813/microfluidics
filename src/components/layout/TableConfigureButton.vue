<script setup lang="ts">
import CustomizedTable from '../fluidTable/CustomizedTable.vue'
import { ref } from 'vue'

const tableDialog = ref(false)

function onButtonClick() {
  tableDialog.value = true
}
</script>

<template>
  <div>
    <button @click="onButtonClick" class="icon-button with-bottom-border">
      <v-icon size="small" color="#66615b">mdi-table</v-icon>
    </button>
    <CustomizedTable v-model:isTableVisible="tableDialog" />
  </div>
</template>
