<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

type Duration = {
  startTime: number
  duration: number
  endTime: number
}

type DurationSet = {
  list: Duration[]
}
const { selected } = defineProps<NodeProps>()
const nodeIsHovered = ref(false)

const totalDuration = ref<number>(10)

const data1: Duration = {
  startTime: 0,
  duration: 6,
  endTime: 6
}

const data2: Duration = {
  startTime: 2,
  duration: 3,
  endTime: 5
}

const data3: Duration = {
  startTime: 8,
  duration: 2,
  endTime: 10
}

const data4: Duration = {
  startTime: 7,
  duration: 1,
  endTime: 8
}

const dataCollection = ref<DurationSet[]>([])

function addData(data: Duration) {
  if (dataCollection.value.length === 0) {
    dataCollection.value.push({
      list: [data]
    })
    return
  }

  for (let i = 0; i < dataCollection.value.length; i++) {
    const durationSet = dataCollection.value[i]
    let isOverlap = false

    for (let j = 0; j < durationSet.list.length; j++) {
      const duration = durationSet.list[j]

      // check if there is an overlap
      if (
        (data.endTime <= duration.endTime && data.endTime > duration.startTime) ||
        (data.startTime >= duration.startTime && data.startTime < duration.endTime) ||
        (data.startTime <= duration.startTime && data.endTime >= duration.endTime)
      ) {
        isOverlap = true
        break // Exit the inner loop when isOverlap is true
      }
    }

    if (!isOverlap) {
      durationSet.list.push(data)
      return // Exit the function when isOverlap is true
    }
  }

  // If no overlap was found in any durationSet, add a new durationSet
  dataCollection.value.push({
    list: [data]
  })
}

function calculateLeft(startTime: number, index: number, durationSet: DurationSet): number {
  // Calculate the left position based on the startTime
  if (index === 0) {
    return (startTime / 10) * 368
  } else {
    const previousItem = durationSet.list[index - 1]
    return ((startTime - previousItem.endTime) / 10) * 368
  }
}

function calculateWidth(duration: number): number {
  // Calculate the width of the rectangle based on the duration
  return (duration / 10) * 368 // Assuming 10s as the total width
}

addData(data1)
addData(data2)
addData(data3)
addData(data4)

console.log(dataCollection.value)
</script>

<template>
  <div
    @mouseover="nodeIsHovered = true"
    @mouseout="nodeIsHovered = false"
    :style="{
      boxShadow:
        selected || nodeIsHovered
          ? '0 0 0 2px rgba(0, 100, 255, 0.2), 0 0 0 4px rgba(0, 100, 255, 0.2)'
          : ''
    }"
  >
    <Handle
      type="source"
      :position="Position.Top"
      :class="selected || nodeIsHovered ? '' : 'top-handle'"
    />
    <Handle
      type="source"
      :position="Position.Bottom"
      :class="selected || nodeIsHovered ? '' : 'bottom-handle'"
    />
    <Handle
      type="source"
      :position="Position.Right"
      :class="selected || nodeIsHovered ? '' : 'right-handle'"
    />
    <Handle
      type="source"
      :position="Position.Left"
      :class="selected || nodeIsHovered ? '' : 'left-handle'"
    />
    <div class="chart">
      <div v-for="(durationSet, idx) in dataCollection" :key="idx" class="row">
        <div
          v-for="(duration, index) in durationSet.list"
          :key="index"
          :style="{
            marginLeft: calculateLeft(duration.startTime, index, durationSet) + 'px',
            width: calculateWidth(duration.duration) + 'px'
          }"
          class="rectangle"
        ></div>
      </div>
      <div class="d-flex">
        <div class="wrap">
          <div class="timeslot"></div>
          <p class="tick">0</p>
        </div>
        <div class="wrap">
          <div class="timeslot"></div>
          <p class="tick">2</p>
        </div>
        <div class="wrap">
          <div class="timeslot"></div>
          <p class="tick">4</p>
        </div>
        <div class="wrap">
          <div class="timeslot"></div>
          <p class="tick">6</p>
        </div>
        <div class="wrap">
          <div class="timeslot"></div>
          <p class="tick">8</p>
        </div>
        <div class="wrap">
          <div class="last-timeslot"></div>
          <p class="tick">10</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  width: 400px;
  height: fit-content;
  border: 1px solid #bdbdbd;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: #eeeeee;
  border-radius: 4px;
}

.row {
  display: flex;
}

.rectangle {
  cursor: pointer;
  height: 20px;
  background-color: #757575; /* Rectangle color */
  border: 1px solid #424242; /* Border color */
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
  width: 73.6px;
  height: 5px;
  display: flex;
  border-left: 1px solid #424242;
  border-bottom: 1px solid #424242;
}

.last-timeslot {
  width: 0px;
  height: 5px;
  display: flex;
  border-right: 1px solid #424242;
}
</style>
