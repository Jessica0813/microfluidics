<template>
  <div
    class="canvas"
    @dragover="onDragOver"
    @drop="onDrop"
    @mouseenter="isCanvasFocused = true"
    @mouseleave="isCanvasFocused = false"
    :style="{
      boxShadow: isCanvasFocused
        ? '4px 4px 8px 2px rgba(128, 128, 128, 0.6)'
        : '4px 4px 8px 2px rgba(128, 128, 128, 0.2)'
    }"
  >
    <SensorEditMenu :design-canvas-ref="svg" :transform="transform" />
    <SensorPanel
      class="sensor-panel"
      v-show="isDesignCanvasVisible"
      v-model:isPanelMenuOpen="isPanelMenuOpen"
    />
    <svg ref="svg" width="100%" height="100%" @click="removeSelectedSensor" id="design-canvas">
      <defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="none" stroke="#E0E0E0" stroke-width="0.5" />
        </pattern>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect
            width="100%"
            height="100%"
            fill="url(#smallGrid)"
            stroke="#E0E0E0"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" x="0" y="0" fill="url(#grid)" />
      <g id="canvas"></g>
    </svg>
    <div class="control-bar" v-show="isDesignCanvasVisible">
      <DesignCanvasControl
        v-model:transform="transform"
        :d3-zoom="d3Zoom"
        :d3-selection="d3Selection"
      />
    </div>
    <button
      @click="designCanvasSize = designCanvasSize === 'small' ? 'large' : 'small'"
      class="button-size"
      v-if="isCanvasFocused && isDesignCanvasVisible"
      @mouseenter="isButtonHovered = true"
      @mouseleave="isButtonHovered = false"
    >
      <IconEnlarge :size="isButtonHovered ? 28 : 24" v-if="designCanvasSize === 'small'" />
      <IconSchrink :size="isButtonHovered ? 28 : 24" v-else />
    </button>
    <button
      class="button-canvas-down"
      @click.stop="onCanvasHideClick"
      v-if="isCanvasFocused && isDesignCanvasVisible"
    >
      <IconScreenSchrink />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import type { D3Zoom, D3Selection } from '@/types/d3'
import hotkeys from 'hotkeys-js'

import { type Sensor, SensorType } from '@/types/sensor'

import { useDrop } from '@/composables/useDrop'
import {
  d3UpperLeftResize,
  d3UpperRightResize,
  d3LowerLeftResize,
  d3LowerRightResize,
  d3Drag
} from '@/composables/useSensorDragandResize'

import { useSensorStore } from '@/stores/useSensorStore'
import { useSensorCanvasStore } from '@/stores/useSensorCanvasStore'

import SensorEditMenu from './SensorEditMenu.vue'
import SensorPanel from './SensorPanel.vue'
import DesignCanvasControl from './DesignCanvasControl.vue'
import IconEnlarge from '../icons/IconEnlarge.vue'
import IconSchrink from '../icons/IconSchrink.vue'
import IconScreenSchrink from '../icons/IconScreenSchrink.vue'

const isDesignCanvasVisible = defineModel<boolean>('isDesignCanvasVisible', { default: true })
const designCanvasSize = defineModel<string>('designCanvasSize', { default: 'small' })

const svg = ref<HTMLElement | null>(null)
const d3Zoom = ref<D3Zoom>()
const d3Selection = ref<D3Selection>()
const transform = ref({ x: 0, y: 0, k: 1 })
const isCanvasFocused = ref(false)
const isButtonHovered = ref(false)
const isPanelMenuOpen = ref(false)

const { sensors, removeAllSelectedSensors, addSensor, getSensorId, editSensor, editMultiSensors } =
  useSensorStore()
const { setZooming } = useSensorCanvasStore()
const { selectedSensors } = storeToRefs(useSensorStore())

function onDragOver(event: any) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(event: any) {
  if (!svg.value) return
  const type = event.dataTransfer?.getData('application/desgin')
  if (
    type === SensorType.Temperature ||
    type === SensorType.Viscosity ||
    type === SensorType.Color
  ) {
    const left = svg.value.getBoundingClientRect().left
    const top = svg.value.getBoundingClientRect().top
    useDrop(left, top, event, transform.value, getSensorId(), addSensor)
  }
  isPanelMenuOpen.value = false
}

function removeSelectedSensor() {
  if (isDesignCanvasVisible.value) {
    removeAllSelectedSensors()
  } else {
    isDesignCanvasVisible.value = true
  }
}

function onCanvasHideClick() {
  isDesignCanvasVisible.value = !isDesignCanvasVisible.value
  removeAllSelectedSensors()
}

hotkeys('up, down, left, right', (event, handler) => {
  event.preventDefault()
  if (selectedSensors.value.length === 1) {
    const sensor = selectedSensors.value[0]
    let updatedSensor = {
      x: sensor.position.x,
      y: sensor.position.y
    }
    if (handler.key === 'up') {
      updatedSensor.y -= 1
    } else if (handler.key === 'down') {
      updatedSensor.y += 1
    } else if (handler.key === 'left') {
      updatedSensor.x -= 1
    } else if (handler.key === 'right') {
      updatedSensor.x += 1
    }
    editSensor(sensor.id, { position: updatedSensor })
  } else if (selectedSensors.value.length > 1) {
    const idList = selectedSensors.value.map((sensor) => sensor.id)
    const updatedSensorList = selectedSensors.value.map((sensor) => {
      return {
        position: {
          x: sensor.position.x,
          y: sensor.position.y
        }
      }
    })
    if (handler.key === 'up') {
      updatedSensorList.forEach((sensor) => {
        sensor.position.y -= 1
      })
    } else if (handler.key === 'down') {
      updatedSensorList.forEach((sensor) => {
        sensor.position.y += 1
      })
    } else if (handler.key === 'left') {
      updatedSensorList.forEach((sensor) => {
        sensor.position.x -= 1
      })
    } else if (handler.key === 'right') {
      updatedSensorList.forEach((sensor) => {
        sensor.position.x += 1
      })
    }
    editMultiSensors(idList, updatedSensorList)
  }
})

onMounted(() => {
  if (!svg.value) return
  d3Selection.value = select(svg.value)
  const patternGrid = d3Selection.value.select('#grid')
  const patternInnerGrid = d3Selection.value.select('#smallGrid')
  const canvas = d3Selection.value.select('#canvas')

  d3Zoom.value = zoom<HTMLElement, any>()
    .scaleExtent([0.2, 2])
    .on('start', () => {
      setZooming()
    })
    .on('end', () => {
      setZooming()
    })
    .on('zoom', (event) => {
      transform.value = event.transform

      const transform10 = event.transform.k * 10
      const transform50 = transform10 * 5
      patternGrid
        .attr('x', event.transform.x % transform50)
        .attr('y', event.transform.y % transform50)
        .attr('width', transform50)
        .attr('height', transform50)
      patternInnerGrid.attr('width', transform10).attr('height', transform10)

      canvas.attr('transform', event.transform)
    })
    .filter((event) => {
      if (event.type === 'dblclick') {
        return false
      }
      return true
    })

  d3Selection.value.call(d3Zoom.value).on('wheel.zoom')

  const updateCirclesWithText = () => {
    const sensorGroup = canvas.selectAll<SVGGElement, Sensor>('.sensor-group').data(sensors)
    const sensor = sensorGroup.selectAll('.sensor').data((d) => [d])
    const sensorText = sensorGroup.selectAll('.sensor-label').data((d) => [d])
    const sensorRect = sensorGroup.selectAll('.sensor-rect').data((d) => [d])
    const upperLeftDot = sensorGroup.selectAll('.upper-left-dot').data((d) => [d])
    const upperRightDot = sensorGroup.selectAll('.upper-right-dot').data((d) => [d])
    const lowerLeftDot = sensorGroup.selectAll('.lower-left-dot').data((d) => [d])
    const lowerRightDot = sensorGroup.selectAll('.lower-right-dot').data((d) => [d])

    // Enter
    const sensorEnter = sensorGroup
      .enter()
      .append('g')
      .attr('class', 'sensor-group')
      .attr('id', (sensor) => `sensor-${sensor.id}`)

    // Append Circle
    sensorEnter
      .append('circle')
      .attr('class', 'sensor')
      .attr('r', (sensor) => sensor.radius)
      .attr('cx', (sensor) => sensor.position.x)
      .attr('cy', (sensor) => sensor.position.y)
      .attr('fill', (sensor) =>
        sensor.type === 'temperature' ? '#CFD8DC' : sensor.type === 'color' ? '#B0BEC5' : '#90A4AE'
      )

    // add rect around circle
    sensorEnter
      .append('rect')
      .attr('class', 'sensor-rect')
      .attr('x', (sensor) => sensor.position.x - sensor.radius)
      .attr('y', (sensor) => sensor.position.y - sensor.radius)
      .attr('width', (sensor) => sensor.radius * 2)
      .attr('height', (sensor) => sensor.radius * 2)
      .attr('fill', 'none')
      .attr('stroke', '#BDBDBD')
      .attr('stroke-width', 1)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    //add hover effect
    sensorEnter
      .append('circle')
      .attr('class', 'upper-left-dot')
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('r', 4)
      .attr('fill', '#BDBDBD')
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .call(d3UpperLeftResize())
      .on('mouseover', () => {
        select('body').style('cursor', 'nwse-resize')
      })
      .on('mouseout', () => {
        select('body').style('cursor', 'default')
      })

    sensorEnter
      .append('circle')
      .attr('class', 'upper-right-dot')
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3UpperRightResize())
      .on('mouseover', () => {
        select('body').style('cursor', 'nesw-resize')
      })
      .on('mouseout', () => {
        select('body').style('cursor', 'default')
      })

    sensorEnter
      .append('circle')
      .attr('class', 'lower-left-dot')
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3LowerLeftResize())
      .on('mouseover', () => {
        select('body').style('cursor', 'nesw-resize')
      })
      .on('mouseout', () => {
        select('body').style('cursor', 'default')
      })

    sensorEnter
      .append('circle')
      .attr('class', 'lower-right-dot')
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('r', 4)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))
      .attr('fill', '#BDBDBD')
      .call(d3LowerRightResize())
      .on('mouseover', () => {
        select('body').style('cursor', 'nwse-resize')
      })
      .on('mouseout', () => {
        select('body').style('cursor', 'default')
      })

    // Append Text
    sensorEnter
      .append('text')
      .attr('class', 'sensor-label')
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('dy', (sensor) => -sensor.radius - 5) // Adjust the text position based on your preference
      .attr('text-anchor', 'middle') // Center the text on the circle
      .style('font-size', 12)
      .text((sensor) => sensor.name)

    sensorEnter.call(d3Drag()).on('click', (event) => {
      event.stopPropagation()
    })

    // Update
    sensor
      .attr('r', (sensor) => sensor.radius)
      .attr('cx', (sensor) => sensor.position.x)
      .attr('cy', (sensor) => sensor.position.y)
      .attr('fill', (sensor) =>
        sensor.type === 'temperature' ? '#CFD8DC' : sensor.type === 'color' ? '#B0BEC5' : '#90A4AE'
      )

    sensorText
      .attr('x', (sensor) => sensor.position.x)
      .attr('y', (sensor) => sensor.position.y)
      .attr('dy', (sensor) => -sensor.radius - 5)
      .text((sensor) => sensor.name)

    sensorRect
      .attr('x', (sensor) => sensor.position.x - sensor.radius)
      .attr('y', (sensor) => sensor.position.y - sensor.radius)
      .attr('width', (sensor) => sensor.radius * 2)
      .attr('height', (sensor) => sensor.radius * 2)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    upperLeftDot
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    upperRightDot
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y - sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    lowerLeftDot
      .attr('cx', (sensor) => sensor.position.x - sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    lowerRightDot
      .attr('cx', (sensor) => sensor.position.x + sensor.radius)
      .attr('cy', (sensor) => sensor.position.y + sensor.radius)
      .attr('display', (sensor) => (sensor.selected ? 'block' : 'none'))

    // Exit
    sensorGroup.exit().remove()
  }

  // Watch for changes in the sensors array and update the visualization
  watch(() => sensors, updateCirclesWithText, { deep: true, immediate: true })
})
</script>

<style scoped>
.canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
  background-color: #faf9f7;
  border: 1px solid #dfdfdf;
  border-radius: 8px;
  transition: box-shadow 0.5s ease;
}

.control-bar {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 5;
}

.sensor-panel {
  position: absolute;
  top: 35%;
  left: 10px;
  z-index: 5;
  cursor: pointer;
}

.button-size {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-canvas-down {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style>
.new-creation {
  animation: fadeIn 1s ease-in;
}
</style>
