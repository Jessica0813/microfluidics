<template>
  <div style="overflow: auto; max-width: 100%; max-height: 100%">
    <svg ref="chart"></svg>
  </div>
</template>

<script setup lang="ts">
import { select } from 'd3-selection'
import { scaleLinear, scaleBand, axisTop } from 'd3'
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
  },
]

const marginX = 10
const marginTop = 25
const barHeight = 20
const width = Math.ceil(totolDuration.value / 10 + 1) * 80
const height = barHeight * flowControlProcesses.length + marginTop
const x = scaleLinear()
  .domain([0, totolDuration.value])
  .range([marginX, width - marginX])

const y = scaleBand()
  .domain(['1', '2', '3', '4'])
  .range([marginTop, height - 5 ])
  .padding(0.15)

const chart = ref<SVGAElement | null>(null)

onMounted(() => {
  if (!chart.value) return
  const svgChart = select(chart.value)
  svgChart
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: auto; max-height: auto; font: 10px sans-serif;')

  svgChart
    .append('g')
    .attr('fill', 'steelblue')
    .selectAll()
    .data(flowControlProcesses)
    .join('rect')
    .attr('x', (d) => x(d.startTime))
    .attr('y', (d) => y(d.id)!)
    .attr('width', (d) => x(d.endTime) - x(d.startTime))
    .attr('height', y.bandwidth())

  svgChart
    .append('g')
    .attr('transform', `translate(0,${marginTop})`)
    .call(axisTop(x).ticks(width / 80))

  svgChart.node()
})
</script>
