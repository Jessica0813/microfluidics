<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FlowConfigs } from '@/types/flowControl'
import RangeBarChart from './RangeBarChart.vue'
import CreateEditScheduledProcessDialog from './CreateEditScheduledProcessDialog.vue';

const props = defineProps({
  totalDuration: {
    type: Number,
    required: true
  },
  flowControlProcesses: {
    type: Array as () => FlowConfigs[],
    required: true
  }
})

const flowControls = ref<FlowConfigs[]>(props.flowControlProcesses)
const duration = ref<number>(props.totalDuration)
const isCreateNewProcessDialogVisible = ref(false)

const scheduledProcessDialog = ref(false)

function onButtonClick() {
  scheduledProcessDialog.value = true
}

function onAddNewProcessButtonClick() {
  isCreateNewProcessDialogVisible.value = true
}

watch(
  () => flowControls.value,
  () => {
    console.log('props.flowControlProcesses', props.flowControlProcesses)
    console.log('flowControls.value', flowControls.value)
  }
)
</script>

<template>
  <div>
    <CreateEditScheduledProcessDialog
      v-model:isCreateNewProcessDialogVisible="isCreateNewProcessDialogVisible"
      v-model:flowControlProcesses="flowControls"
      :index="-1"
    />
    <v-icon size="small" color="grey-darken-3" @click="onButtonClick"> mdi-dots-vertical</v-icon>
    <v-dialog v-model="scheduledProcessDialog" width="80%" persistent>
      <div class="dialog">
        <div class="d-flex pb-4">
          <v-spacer></v-spacer>
          <v-icon
            class="pr-4"
            size="20"
            color="grey-darken-1"
            @click="scheduledProcessDialog = false"
          >
            mdi-close
          </v-icon>
        </div>
        <div style="display: flex; flex-direction: row; padding: 0px 8px">
          <div style="width: 200px">
            <v-text-field
              v-model="duration"
              type="number"
              label="duration"
              variant="outlined"
              density="compact"
              suffix="s"
              color="blue-darken-3"
            >
            </v-text-field>
          </div>
          <v-spacer></v-spacer>
        </div>
        <RangeBarChart
          :flowControlProcesses="flowControls"
          :totalDuration="duration"
          :width="1078"
          :is-bar-chart-clickable="true"
        />
        <div class="d-flex px-2 pt-2">
          <v-spacer></v-spacer>
          <button class="button" @click="onAddNewProcessButtonClick">Add new process</button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.dialog {
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 40px 16px;
  border-radius: 4px;
}
.button {
  width: fit-content;
  height: fit-content;
  background-color: #515a6e;
  color: white;
  border-radius: 4px;
  padding: 8px;
  border: none;
  font-size: 14px;
}
</style>
