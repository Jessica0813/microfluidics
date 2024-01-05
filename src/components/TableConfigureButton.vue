<script setup lang="ts">
import CustomizedButton from './CustomizedButton.vue'
import CustomizedTable from './CustomizedTable.vue'
import { ref } from 'vue'

const tableDialog = ref(false)

function onButtonClick() {
  tableDialog.value = true
}
</script>

<template>
  <div>
    <CustomizedButton @onClick="onButtonClick" buttonName="Fluid Table" />
    <CustomizedTable v-model:isTableVisible="tableDialog" />
  </div>
</template>
