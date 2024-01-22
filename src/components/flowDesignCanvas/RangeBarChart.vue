<script setup lang="ts">
import type { FlowConfigs } from '@/types/flowControl'
import { computed, ref } from 'vue'
import CreateEditScheduledProcessDialog from './CreateEditScheduledProcessDialog.vue';

// const rangeBar = ref<HTMLElement | null>(null)
// let width = 0;
// let timeSlotWidth = 0;
// onMounted(() => {
//   if (!rangeBar.value) return
//   width = rangeBar.value.getBoundingClientRect().width - 32
//   timeSlotWidth = width / 5
// })

// onUpdated(() => {
//   if (!rangeBar.value) return
//   width = rangeBar.value.getBoundingClientRect().width - 32
//   timeSlotWidth = width / 5
//   console.log(width)
// })
const props = defineProps({
  totalDuration: {
    type: Number,
    required: true
  },
  flowControlProcesses: {
    type: Array as () => FlowConfigs[],
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  isBarChartClickable: {
    type: Boolean,
    default: false
  }
})

const timeSlotWidth = computed(() => {
  return props.width / 5
})

function calculateLeft(startTime: number, index: number, flowControlList: FlowConfigs[]): number {
  // Calculate the left position based on the startTime
  if (index === 0) {
    return (startTime / props.totalDuration) * props.width
  } else {
    const previousItem = flowControlList[index - 1]
    return ((startTime - previousItem.endTime) / props.totalDuration) * props.width
  }
}

function calculateWidth(duration: number): number {
  // Calculate the width of the rectangle based on the duration
  return (duration / props.totalDuration) * props.width // Assuming 20s as the total width
}

const tickArray = computed(() => {
  // distance must be a integer
  const distance = Math.floor(props.totalDuration / 5)
  // Array is 5 numbers which starts from 0, and the distance variable is the interval
  return Array.from({ length: 5 }, (_, index) => index * distance)
})

const flowControls = ref<FlowConfigs[]>(props.flowControlProcesses)
const isCreateNewProcessDialogVisible = ref(false)
const index = ref(-1)
function onProcessClick(outArrayIndex: number) {
  if (!props.isBarChartClickable) return
  index.value = outArrayIndex
  isCreateNewProcessDialogVisible.value = true
}

</script>

<template>
  <CreateEditScheduledProcessDialog
    v-model:isCreateNewProcessDialogVisible="isCreateNewProcessDialogVisible"
    v-model:flowControlProcesses="flowControls"
    :index="index"
    :isCreateNewProcessMode="false"
  />
  <div class="chart">
    <div class="bar">
      <div
        v-for="(flowControlConfigs, idx) in flowControlProcesses"
        :key="idx"
        :style="{
          marginLeft: calculateLeft(flowControlConfigs.startTime, idx, flowControlProcesses) + 'px',
          width: calculateWidth(flowControlConfigs.duration) + 'px'
        }"
        class="rectangle-div"
      >
        <div
          v-for="(flowControl, index) in flowControlConfigs.flowControlList"
          :key="index"
          class="rectangle"
          @click="onProcessClick(idx)"
        >
          <v-tooltip activator="parent" offset="0">
            <div>
              <p>Inlet: {{ flowControl.inlet }}</p>
              <p>Fluid: {{ flowControl.fluid }}</p>
              <p>Pressure: {{ flowControl.pressure }}</p>
              <p>Injection: {{ flowControl.injection }}</p>
              <p>Start Time: {{ flowControlConfigs.startTime }}</p>
              <p>Duration: {{ flowControlConfigs.duration }}</p>
              <p>End Time: {{ flowControlConfigs.endTime }}</p>
            </div>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div class="d-flex">
      <div class="wrap" v-for="(tickNumber, idx) in tickArray" :key="idx">
        <div class="timeslot" :style="{ width: timeSlotWidth + 'px' }"></div>
        <p class="tick">{{ tickNumber }}</p>
      </div>
      <div class="wrap">
        <div class="last-timeslot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
  height: fit-content;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
}

.bar {
  display: flex;
  flex-direction: row;
  margin-bottom: 4px;
}

.rectangle-div {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.rectangle {
  cursor: pointer;
  height: 20px;
  background-color: #bdbdbd; /* Rectangle color */
  box-sizing: border-box;
  margin-bottom: 4px; /* Adjust the margin between rectangles */
  border-radius: 4px;
}

.wrap {
  display: flex;
  flex-direction: column;
  align-items: left;
}

.tick {
  margin-left: -4px;
  font-size: 12px;
}

.timeslot {
  height: 5px;
  display: flex;
  border-left: 1px solid #424242;
  border-bottom: 1px solid #424242;
}

.last-timeslot {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #424242;
  rotate: 90deg;
  margin-left: -2px;
  margin-top: 2px;
}
</style>
