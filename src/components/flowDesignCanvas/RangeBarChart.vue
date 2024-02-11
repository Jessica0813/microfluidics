<template>
  <div style="overflow: auto; max-width: 100%; max-height: 100%">
    <svg ref="chart">
      <g id="xAxis"></g>
      <g id="chartContent" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { select } from 'd3-selection'
import { scaleLinear, scaleBand, axisTop } from 'd3'
import { onMounted, ref, watch, computed } from 'vue'
import type { FlowControlProcess } from '@/types/flowControl'
import tippy from 'tippy.js'
import type { Instance } from 'tippy.js'
import { useLeftResize, useRightResize, useDrag } from '@/composables/useDragandResize'

const props = defineProps({
  id: String,
  totalDuration: Number,
})

const flowControlProcesses = defineModel<FlowControlProcess[]>('flowControlProcesses', { default: [] })

const chart = ref<SVGAElement | null>(null)
let instances: Instance[] = []

const marginX = 18
const marginTop = 20
const barHeight = 20
const width = computed(() => (props.totalDuration! / 10) * 100 + marginX * 2)
const height = computed(() => barHeight * flowControlProcesses.value.length + marginTop)

const x = computed(() =>
  scaleLinear()
    .domain([0, props.totalDuration!])
    .range([marginX, width.value - marginX])
)

const y = computed(() =>
  scaleBand()
    .domain(flowControlProcesses.value.map((p) => p.id))
    .range([marginTop, height.value])
    .padding(0.15)
)

onMounted(() => {
  if (!chart.value) return
  const svgChart = select(chart.value)
  const chartContent = svgChart.select('#chartContent')
  const xAxis = svgChart.select<SVGGElement>('#xAxis')

  svgChart
    .attr('width', width.value)
    .attr('height', height.value)
    .attr('style', 'max-width: auto; max-height: auto; font: 10px sans-serif;')

  const contentGroup = chartContent
    .selectAll<SVGGElement, FlowControlProcess>('.process-group')
    .data(flowControlProcesses.value)

  // Enter selection for creating new process groups
  const enterSelection = contentGroup
    .enter()
    .append('g')
    .attr('id', (d) => `${props.id}-process-group-${d.id}`)
    .on('mouseenter', (event, d) => {
      select(`#${props.id}-delete-icon-${d.id}`).style('display', 'block')
    })
    .on('mouseleave', (event, d) => {
      select(`#${props.id}-delete-icon-${d.id}`).style('display', 'none')
    })

  enterSelection
    .append('rect')
    .attr('x', x.value(0))
    .attr('y', (d) => y.value(d.id)!)
    .attr('width', width.value)
    .attr('height', y.value.bandwidth())
    .style('visibility', 'hidden')

  const processes = enterSelection
    .append('rect')
    .attr('class', `${props.id}-process`)
    .attr('x', (d) => x.value(d.startTime))
    .attr('y', (d) => y.value(d.id)!)
    .attr('width', (d) => x.value(d.endTime) - x.value(d.startTime))
    .attr('height', y.value.bandwidth())
    .attr('id', (d) => `${props.id}-process-${d.id}`)
    .attr('fill', '#BDBDBD')

  instances = tippy(`.${props.id}-process`, {
    allowHTML: true,
    arrow: true,
    theme: 'light',
    trigger: 'mouseenter',
    placement: 'bottom',
    offset: [5, 5],
    content: (reference) => {
      const id = reference.getAttribute('id')
      const process = flowControlProcesses.value.find((p) => `${props.id}-process-${p.id}` === id)
      if (process) {
        return `
        <div style="font-size: 10px;">
        Duration: ${process.startTime}-${process.endTime}<br>
        Inlet: ${process.inlet}<br>
        Injection: ${process.injection}<br>
        Fluid: ${process.fluid}<br>
        Pressure: ${process.pressure}
        </div>
        `
      }
      return ''
    }
  })

  processes.call(useDrag(props.id!, instances, width.value, marginX))

  enterSelection
    .append('line')
    .attr('x1', (d) => x.value(d.startTime)) // x-coordinate of the start line
    .attr('y1', (d) => y.value(d.id)!) // y-coordinate of the start line
    .attr('x2', (d) => x.value(d.startTime)) // x-coordinate of the end line (same as start for a vertical line)
    .attr('y2', (d) => y.value(d.id)! + y.value.bandwidth()) // y-coordinate of the end line (bottom of the rectangle)
    .attr('stroke-width', 5)
    .attr('stroke', 'transparent') // Color of the line
    .attr('id', (d) => `${props.id}-start-line-${d.id}`) // id related to d.id
    .style('cursor', 'ew-resize')
    .call(useLeftResize(props.id!, instances))

  enterSelection
    .append('line')
    .attr('x1', (d) => x.value(d.endTime)) // x-coordinate of the start line
    .attr('y1', (d) => y.value(d.id)!) // y-coordinate of the start line
    .attr('x2', (d) => x.value(d.endTime)) // x-coordinate of the end line (same as start for a vertical line)
    .attr('y2', (d) => y.value(d.id)! + y.value.bandwidth()) // y-coordinate of the end line (bottom of the rectangle)
    .attr('stroke-width', 5)
    .attr('stroke', 'transparent') // Color of the line
    .attr('id', (d) => `${props.id}-end-line-${d.id}`)
    .style('cursor', 'ew-resize')
    .call(useRightResize(props.id!, instances, width.value, marginX))

  const deleteIcon = enterSelection
    .append('g')
    .attr('id', (d) => `${props.id}-delete-icon-${d.id}`)
    .style('cursor', 'pointer')
    .style('display', 'none')
    .on('click', (event, d) => {
      console.log('delete', d.id)
    })

  deleteIcon
    .append('line')
    .attr('x1', (d) => x.value(d.endTime) + 6)
    .attr('y1', (d) => y.value(d.id)! + y.value.bandwidth() / 2)
    .attr('x2', (d) => x.value(d.endTime) + 14)
    .attr('y2', (d) => y.value(d.id)! + y.value.bandwidth() / 2)
    .attr('stroke-width', 2)
    .attr('stroke', 'grey')

  deleteIcon
    .append('circle')
    .attr('cx', (d) => x.value(d.endTime) + 10)
    .attr('cy', (d) => y.value(d.id)! + y.value.bandwidth() / 2)
    .attr('r', 7)
    .attr('stroke', 'grey')
    .attr('fill', 'transparent')
    .attr('stroke-width', 0.5)

  xAxis.attr('transform', `translate(0,${marginTop})`).call(axisTop(x.value).ticks(width.value / 100))

  svgChart.node()
})
</script>
