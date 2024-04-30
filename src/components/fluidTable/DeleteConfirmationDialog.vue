<template>
  <v-dialog v-model="isDeleteDialogVisible" min-width="300" max-width="500" persistent>
    <v-card>
      <v-toolbar density="compact" flat height="52" :color="'transparent'">
        <v-spacer></v-spacer>
        <v-icon class="pr-4" size="20" color="grey-darken-1" @click="emit('close')">
          mdi-close
        </v-icon>
      </v-toolbar>
      <v-card-title class="text-center">Delete Confirmation</v-card-title>
      <v-card-text class="text-center">Are you sure you want to delete this item?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <CustomizedButton isCancelAction buttonName="Cancel" @onClick="emit('cancel')" />
        <CustomizedButton buttonName="Delete" @onClick="emit('confirm')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import CustomizedButton from './CustomizedButton.vue'
import { defineModel } from 'vue'

const emit = defineEmits(['close', 'cancel', 'confirm'])
const isDeleteDialogVisible = defineModel<boolean>()
</script>
