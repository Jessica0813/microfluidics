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
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import { onMounted, ref } from 'vue'
import type { FlowControlProcess } from '@/types/flowControl'

const totolDuration = ref(45)

const flowControlProcesses: FlowControlProcess[] = [
  {
    id: '1',
    startTime: 0,
    endTime: 20,
    duration: 20,
    inlet: 'Inlet 1',
    injection: 'Injection Type A',
    fluid: 'water',
    pressure: 20
  },
  {
    id: '2',
    startTime: 0,
    endTime: 20,
    duration: 20,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '3',
    startTime: 10,
    endTime: 25,
    duration: 15,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '4',
    startTime: 30,
    endTime: 40,
    duration: 10,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  }
]

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

const chart = ref<SVGAElement | null>(null)

const d3Drag = drag<SVGRectElement, FlowControlProcess, any>()
let startOffsetX: number = 0
d3Drag.on('start', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
  const x = select(`#process-${event.subject.id}`).attr('x')
  startOffsetX = event.x - Number(x)
})
d3Drag.on('drag', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
  const selection = select(`#process-${event.subject.id}`)
  let x = event.x - startOffsetX
  const start = marginX
  const end = width - marginX - Number(selection.attr('width'))
  if (x <= start) {
    x = start
  }
  if (x >= end) {
    x = end
  }
  selection.attr('x', x)
})
d3Drag.on('end', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
  console.log('end', event)
})

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
    .selectAll<SVGRectElement, FlowControlProcess>('.rect')
    .data(flowControlProcesses)

  contentGroup
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.startTime))
    .attr('y', (d) => y(d.id)!)
    .attr('width', (d) => x(d.endTime) - x(d.startTime))
    .attr('height', y.bandwidth())
    .attr('id', (d) => `process-${d.id}`)
    .attr('fill', '#BDBDBD')
    .call(d3Drag)

  xAxis.attr('transform', `translate(0,${marginTop})`).call(axisTop(x).ticks(width / 100))

  svgChart.node()
})
</script>
