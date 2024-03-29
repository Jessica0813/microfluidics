<template>
  <div style="overflow: auto; max-width: 100%; max-height: 100%" @click="onClick">
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
import { useTooltipContent } from '@/composables/useTooltipContent'
import { useVueFlow } from '@vue-flow/core'

const props = defineProps({
  id: String,
  totalDuration: Number
})

const { findNode } = useVueFlow()

const isMenuOpen = defineModel<boolean>('isMenuOpen', { default: false })
// const isEditingProcess = defineModel<boolean>('isEditingProcess', { default: false })
const editedProcess = defineModel<FlowControlProcess>('editedProcess')
const flowControlProcesses = defineModel<FlowControlProcess[]>('flowControlProcesses', {
  default: []
})

const chart = ref<SVGAElement | null>(null)
let instances: Instance[] = []

const marginX = 17
const marginTop = 10
const barHeight = 20

function onClick(event: MouseEvent) {
  event.stopPropagation()
  if (editedProcess.value) {
    editedProcess.value.selected = false
  }
}

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
      .padding(0.1)

    svgChart.attr('width', width).attr('height', height)

    xAxis.call(
      axisTop(x)
        .ticks(width / 100)
        .tickSize(-height)
        .tickSizeOuter(0)
    )
    xAxis.selectAll('.tick line').attr('opacity', 0.2)
    xAxis.selectAll('.tick text').attr('opacity', 0.6)
    xAxis.select('.domain').style('display', 'none')

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
      .attr('x', (d) => x(d.startTime))
      .attr('y', (d) => y(d.id)!)
      .attr('width', (d) => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => (d.selected ? '#007bff' : '#BDBDBD'))
      .call(useDrag(props.id!, instances, width, marginX))
      .on('click', (event, d) => {
        //update relative process with selected is true
        event.stopPropagation()

        const node = findNode(props.id)

        if (node && !node.selected) {
          node.selected = true
        }

        flowControlProcesses.value = flowControlProcesses.value.map((p) => {
          if (p.id === d.id) {
            p.selected = true
          } else {
            p.selected = false
          }
          return p
        })
        editedProcess.value = flowControlProcesses.value.find((p) => p.id === d.id)!
        isMenuOpen.value = true
      })

    for (const process of flowControlProcesses.value) {
      const isInstanceExisted = instances.some(
        (i) => `${props.id}-process-${process.id}` === i.reference.getAttribute('id')
      )
      if (!isInstanceExisted) {
        const instance = tippy(`#${props.id}-process-${process.id}`, {
          allowHTML: true,
          maxWidth: 200,
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
            return useTooltipContent(process!)
          }
        })
        instances.push(instance[0])
      }
    }

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
      .attr('fill', (d) => (d.selected ? '#007bff' : '#BDBDBD'))
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

  watch(
    () => [flowControlProcesses, props.totalDuration],
    () => {
      updateProcess()
    },
    { deep: true }
  )

  watch(
    editedProcess,
    (newValue, oldValue) => {
      if (!editedProcess.value) return
      if (editedProcess.value.id) {
        if (
          newValue?.startTime !== oldValue?.startTime ||
          newValue?.endTime !== oldValue?.endTime
        ) {
          editedProcess.value.duration = editedProcess.value.endTime - editedProcess.value.startTime
        }
        const instance = instances.find(
          (i) => `${props.id}-process-${editedProcess.value!.id}` === i.reference.getAttribute('id')
        )
        if (instance) {
          instance.setContent(useTooltipContent(editedProcess.value!))
        }
      }
    },
    { deep: true }
  )

  svgChart.node()
})
</script>
