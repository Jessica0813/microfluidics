<template>
  <v-dialog persistent v-model="isDialogVisible" fullscreen>
    <div class="fullscreen">
      <v-progress-circular
        color="primary"
        indeterminate
        :size="200"
        :width="20"
      ></v-progress-circular>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
const isDialogVisible = defineModel<boolean>('isDialogVisible')
</script>

<style scoped>
.fullscreen {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: white;
  justify-content: center;
  align-items: center;
}
</style>
