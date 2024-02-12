<template>
  <div style="overflow: auto; max-width: 100%; max-height: 100%">
    <svg ref="chart" style="max-width: auto; max-height: auto; font: 10px sans-serif">
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
  id: String,
  totalDuration: Number
})

// const flowControlProcesses = defineModel<FlowControlProcess[]>('flowControlProcesses', {
//   default: []
// })

const flowControlProcesses = ref<FlowControlProcess[]>([
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
    endTime: 15.0,
    duration: 5,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  },
  {
    id: '4',
    name: '4',
    startTime: 14.0,
    endTime: 16.0,
    duration: 2,
    inlet: 'Inlet 2',
    injection: 'Injection Type B',
    fluid: 'oil',
    pressure: 25
  }
])

const chart = ref<SVGAElement | null>(null)
let instances: Instance[] = []

const marginX = 17
const marginTop = 20
const barHeight = 20
// const width = computed(() => (props.totalDuration! / 10) * 100 + marginX * 2)
// const height = computed(() => barHeight * flowControlProcesses.value.length + marginTop)

// const x = computed(() =>
//   scaleLinear()
//     .domain([0, props.totalDuration!])
//     .range([marginX, width.value - marginX])
// )

// const y = computed(() =>
//   scaleBand()
//     .domain(flowControlProcesses.value.map((p) => p.id))
//     .range([marginTop, height.value])
//     .padding(0.15)
// )

onMounted(() => {
  if (!chart.value) return
  const svgChart = select(chart.value)
  const chartContent = svgChart.select('#chartContent')
  const xAxis = svgChart.select<SVGGElement>('#xAxis')
  xAxis.attr('transform', `translate(0,${marginTop})`)

  const updateProcess = () => {
    const width = (props.totalDuration! / 10) * 100 + marginX * 2
    const height = barHeight * flowControlProcesses.value.length + marginTop

    const x = scaleLinear()
      .domain([0, props.totalDuration!])
      .range([marginX, width - marginX])

    const y = scaleBand()
      .domain(flowControlProcesses.value.map((p) => p.id))
      .range([marginTop, height])
      .padding(0.15)

    svgChart.attr('width', width).attr('height', height)

    xAxis.call(axisTop(x).ticks(width / 100))
    const contentGroup = chartContent
      .selectAll<SVGGElement, FlowControlProcess>(`.${props.id}-process-group`)
      .data(flowControlProcesses.value, (d) => d.id)

    const backgroundRect = contentGroup
      .selectAll<SVGRectElement, FlowControlProcess>(`${props.id}-process-background-rect`)
      .data((d) => [d])
    const processRect = contentGroup
      .selectAll<SVGRectElement, FlowControlProcess>(`${props.id}-process`)
      .data((d) => [d])
    const startLine = contentGroup
      .selectAll<SVGLineElement, FlowControlProcess>(`${props.id}-start-line`)
      .data((d) => [d])
    const endLine = contentGroup
      .selectAll<SVGLineElement, FlowControlProcess>(`${props.id}-end-line`)
      .data((d) => [d])
    const deleteIconLine = contentGroup
      .selectAll<SVGLineElement, FlowControlProcess>(`${props.id}-delete-icon-line`)
      .data((d) => [d])
    const deleteIconCircle = contentGroup
      .selectAll<SVGCircleElement, FlowControlProcess>(`${props.id}-delete-icon-circle`)
      .data((d) => [d])

    // Enter selection for creating new process groups
    const processEnter = contentGroup
      .enter()
      .append('g')
      .attr('class', `${props.id}-process-group`)
      .on('mouseenter', (event, d) => {
        select(`#${props.id}-delete-icon-${d.id}`).style('display', 'block')
      })
      .on('mouseleave', (event, d) => {
        select(`#${props.id}-delete-icon-${d.id}`).style('display', 'none')
      })

    processEnter
      .append('rect')
      .attr('class', `${props.id}-process-background-rect`)
      .style('visibility', 'hidden')
      .attr('x', x(0))
      .attr('y', (d) => y(d.id)!)
      .attr('width', width)
      .attr('height', y.bandwidth())

    processEnter
      .append('rect')
      .attr('class', `${props.id}-process`)
      .attr('id', (d) => `${props.id}-process-${d.id}`)
      .attr('fill', '#BDBDBD')
      .attr('x', (d) => x(d.startTime))
      .attr('y', (d) => y(d.id)!)
      .attr('width', (d) => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .call(useDrag(props.id!, instances, width, marginX))

    for (const process of flowControlProcesses.value) {
      const isInstanceExisted = instances.some(
        (i) => `${props.id}-process-${process.id}` === i.reference.getAttribute('id')
      )
      if (!isInstanceExisted) {
        const instance = tippy(`#${props.id}-process-${process.id}`, {
          allowHTML: true,
          arrow: true,
          theme: 'light',
          trigger: 'mouseenter',
          placement: 'bottom',
          offset: [5, 5],
          content: (reference) => {
            const id = reference.getAttribute('id')
            const process = flowControlProcesses.value.find(
              (p) => `${props.id}-process-${p.id}` === id
            )
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
        instances.push(instance[0])
      }
    }

    // instances = tippy(`.${props.id}-process`, {
    //   allowHTML: true,
    //   arrow: true,
    //   theme: 'light',
    //   trigger: 'mouseenter',
    //   placement: 'bottom',
    //   offset: [5, 5],
    //   content: (reference) => {
    //     const id = reference.getAttribute('id')
    //     const process = flowControlProcesses.value.find((p) => `${props.id}-process-${p.id}` === id)
    //     if (process) {
    //       return `
    //     <div style="font-size: 10px;">
    //     Duration: ${process.startTime}-${process.endTime}<br>
    //     Inlet: ${process.inlet}<br>
    //     Injection: ${process.injection}<br>
    //     Fluid: ${process.fluid}<br>
    //     Pressure: ${process.pressure}
    //     </div>
    //     `
    //     }
    //     return ''
    //   }
    // })

    processRect.call(useDrag(props.id!, instances, width, marginX))

    processEnter
      .append('line')
      .attr('class', `${props.id}-start-line`)
      .attr('stroke-width', 5)
      .attr('stroke', 'transparent')
      .attr('id', (d) => `${props.id}-start-line-${d.id}`)
      .style('cursor', 'ew-resize')
      .attr('x1', (d) => x(d.startTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.startTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useLeftResize(props.id!, instances, marginX))

    processEnter
      .append('line')
      .attr('class', `${props.id}-end-line`)
      .attr('stroke-width', 5)
      .attr('stroke', 'transparent') // Color of the line
      .attr('id', (d) => `${props.id}-end-line-${d.id}`)
      .style('cursor', 'ew-resize')
      .attr('x1', (d) => x(d.endTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.endTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useRightResize(props.id!, instances, width, marginX))

    const iconGroup = processEnter
      .append('g')
      .attr('class', `${props.id}-delete-icon`)
      .attr('id', (d) => `${props.id}-delete-icon-${d.id}`)
      .style('cursor', 'pointer')
      .style('display', 'none')
      .on('click', (event, d) => {
        flowControlProcesses.value = flowControlProcesses.value.filter((p) => p.id !== d.id)
        const instance = instances.find(
          (i) => `${props.id}-process-${d.id}` === i.reference.getAttribute('id')
        )
        if (instance) {
          instance.destroy()
          instances = instances.filter((i) => i !== instance)
        }
      })

    iconGroup
      .append('line')
      .attr('class', `${props.id}-delete-icon-line`)
      .attr('stroke-width', 1.5)
      .attr('stroke', 'grey')
      .attr('x1', (d) => x(d.endTime) + 6)
      .attr('y1', (d) => y(d.id)! + y.bandwidth() / 2)
      .attr('x2', (d) => x(d.endTime) + 14)
      .attr('y2', (d) => y(d.id)! + y.bandwidth() / 2)

    iconGroup
      .append('circle')
      .attr('class', `${props.id}-delete-icon-circle`)
      .attr('r', 7)
      .attr('stroke', 'grey')
      .attr('fill', 'transparent')
      .attr('stroke-width', 0.5)
      .attr('cx', (d) => x(d.endTime) + 10)
      .attr('cy', (d) => y(d.id)! + y.bandwidth() / 2)

    //remove
    contentGroup.exit().remove()

    //update
    backgroundRect
      .merge(contentGroup.selectAll(`.${props.id}-process-background-rect`))
      .transition()
      .attr('x', x(0))
      .attr('y', (d) => y(d.id)!)
      .attr('width', width)
      .attr('height', y.bandwidth())

    processRect
      .merge(contentGroup.selectAll<SVGRectElement, FlowControlProcess>(`.${props.id}-process`))
      .attr('x', (d) => x(d.startTime))
      .attr('y', (d) => y(d.id)!)
      .attr('width', (d) => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .call(useDrag(props.id!, instances, width, marginX))

    startLine
      .merge(contentGroup.selectAll<SVGLineElement, FlowControlProcess>(`.${props.id}-start-line`))
      .attr('x1', (d) => x(d.startTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.startTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useLeftResize(props.id!, instances, marginX))

    endLine
      .merge(contentGroup.selectAll<SVGLineElement, FlowControlProcess>(`.${props.id}-end-line`))
      .attr('x1', (d) => x(d.endTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.endTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useRightResize(props.id!, instances, width, marginX))

    deleteIconLine
      .merge(
        contentGroup.selectAll<SVGLineElement, FlowControlProcess>(`.${props.id}-delete-icon-line`)
      )
      .attr('x1', (d) => x(d.endTime) + 6)
      .attr('y1', (d) => y(d.id)! + y.bandwidth() / 2)
      .attr('x2', (d) => x(d.endTime) + 14)
      .attr('y2', (d) => y(d.id)! + y.bandwidth() / 2)

    deleteIconCircle
      .merge(
        contentGroup.selectAll<SVGCircleElement, FlowControlProcess>(
          `.${props.id}-delete-icon-circle`
        )
      )
      .attr('cx', (d) => x(d.endTime) + 10)
      .attr('cy', (d) => y(d.id)! + y.bandwidth() / 2)
  }

  updateProcess()

  watch(() => flowControlProcesses, updateProcess, { deep: true })

  svgChart.node()
})
</script>
