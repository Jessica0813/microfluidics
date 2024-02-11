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
import { onMounted, ref, watch } from 'vue'
import type { FlowControlProcess } from '@/types/flowControl'
import tippy from 'tippy.js'
import type { Instance } from 'tippy.js'
import { useLeftResize, useRightResize, useDrag } from '@/composables/useDragandResize'

const props = defineProps({
  id: String
})

const flowControlProcesses: FlowControlProcess[] = [
  {
    id: '1',
    name: '1',
    startTime: 0.0,
    endTime: 20.0,
    duration: 20,
    inlet: 'Inlet 1',
    injection: 'Injection Type A',
    fluid: 'water',
    pressure: 20
  },
  {
    id: '2',
    name: '2',
    startTime: 0.0,
    endTime: 20.0,
    duration: 20,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '3',
    name: '3',
    startTime: 10.0,
    endTime: 25.0,
    duration: 15,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '4',
    name: '4',
    startTime: 30.0,
    endTime: 40.0,
    duration: 10,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  }
]

const totolDuration = ref(45)
const chart = ref<SVGAElement | null>(null)
let instances: Instance[] = []

const marginX = 10
const marginTop = 25
const barHeight = 20
const width = (totolDuration.value / 10) * 100 + marginX * 2
const height = barHeight * flowControlProcesses.length + marginTop
const x = scaleLinear()
  .domain([0, totolDuration.value])
  .range([marginX, width - marginX])

const y = scaleBand()
  .domain(['1', '2', '3', '4'])
  .range([marginTop, height - 5])
  .padding(0.15)

onMounted(() => {
  if (!chart.value) return
  const svgChart = select(chart.value)
  const chartContent = svgChart.select('#chartContent')
  const xAxis = svgChart.select<SVGGElement>('#xAxis')

  svgChart
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: auto; max-height: auto; font: 10px sans-serif;')

  const contentGroup = chartContent
    .selectAll<SVGGElement, FlowControlProcess>('.process-group')
    .data(flowControlProcesses)

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
    .attr('x', x(0))
    .attr('y', (d) => y(d.id)!)
    .attr('width', width - 2 * marginX)
    .attr('height', y.bandwidth())
    .style('visibility', 'hidden')

  const processes = enterSelection
    .append('rect')
    .attr('class', `${props.id}-process`)
    .attr('x', (d) => x(d.startTime))
    .attr('y', (d) => y(d.id)!)
    .attr('width', (d) => x(d.endTime) - x(d.startTime))
    .attr('height', y.bandwidth())
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
      const process = flowControlProcesses.find((p) => `${props.id}-process-${p.id}` === id)
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

  processes.call(useDrag(props.id!, instances, width, marginX))

  enterSelection
    .append('line')
    .attr('x1', (d) => x(d.startTime)) // x-coordinate of the start line
    .attr('y1', (d) => y(d.id)!) // y-coordinate of the start line
    .attr('x2', (d) => x(d.startTime)) // x-coordinate of the end line (same as start for a vertical line)
    .attr('y2', (d) => y(d.id)! + y.bandwidth()) // y-coordinate of the end line (bottom of the rectangle)
    .attr('stroke-width', 5)
    .attr('stroke', 'transparent') // Color of the line
    .attr('id', (d) => `${props.id}-start-line-${d.id}`) // id related to d.id
    .style('cursor', 'ew-resize')
    .call(useLeftResize(props.id!, instances))

  enterSelection
    .append('line')
    .attr('x1', (d) => x(d.endTime)) // x-coordinate of the start line
    .attr('y1', (d) => y(d.id)!) // y-coordinate of the start line
    .attr('x2', (d) => x(d.endTime)) // x-coordinate of the end line (same as start for a vertical line)
    .attr('y2', (d) => y(d.id)! + y.bandwidth()) // y-coordinate of the end line (bottom of the rectangle)
    .attr('stroke-width', 5)
    .attr('stroke', 'transparent') // Color of the line
    .attr('id', (d) => `${props.id}-end-line-${d.id}`)
    .style('cursor', 'ew-resize')
    .call(useRightResize(props.id!, instances, width, marginX))

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
    .attr('x1', (d) => x(d.endTime) + 6)
    .attr('y1', (d) => y(d.id)! + y.bandwidth() / 2)
    .attr('x2', (d) => x(d.endTime) + 14)
    .attr('y2', (d) => y(d.id)! + y.bandwidth() / 2)
    .attr('stroke-width', 2)
    .attr('stroke', 'grey')

  deleteIcon
    .append('circle')
    .attr('cx', (d) => x(d.endTime) + 10)
    .attr('cy', (d) => y(d.id)! + y.bandwidth() / 2)
    .attr('r', 7)
    .attr('stroke', 'grey')
    .attr('fill', 'transparent')
    .attr('stroke-width', 0.5)

  xAxis.attr('transform', `translate(0,${marginTop})`).call(axisTop(x).ticks(width / 100))

  svgChart.node()
})
</script>
