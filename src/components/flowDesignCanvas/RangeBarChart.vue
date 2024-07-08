<template>
  <div style="overflow: auto; max-width: 100%; max-height: 100%" @click="onClick">
    <svg ref="chart" style="max-width: auto; max-height: auto; font: 10px sans-serif">
      <g id="xAxis"></g>
      <g id="chartContent" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useVueFlow } from '@vue-flow/core'
import { select } from 'd3-selection'
import { scaleLinear, scaleBand, axisTop } from 'd3'
import tippy from 'tippy.js'
import type { Instance } from 'tippy.js'

import type { FlowControlProcess, ScheduledFlowControl } from '@/types/flowControl'

import { useLeftResize, useRightResize, useDrag } from '@/composables/useDragandResize'
import { useTooltipContent } from '@/composables/useTooltipContent'

const props = defineProps({
  id: String
})
const scheduledFlowControl = defineModel<ScheduledFlowControl>('scheduledFlowControl', {
  default: {
    totalDuration: 20,
    name: 'a',
    processes: []
  }
})
const flowControlProcesses = defineModel<FlowControlProcess[]>('flowControlProcesses', {
  default: []
})
const editedProcess = defineModel<FlowControlProcess>('editedProcess')

const chart = ref<SVGAElement | null>(null)

let instances: Instance[] = []
const marginX = 17
const marginTop = 10
const barHeight = 20

const { findNode } = useVueFlow()

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
    const width = (scheduledFlowControl.value.totalDuration / 10) * 100 + marginX * 2
    const height = barHeight * flowControlProcesses.value.length + marginTop

    const x = scaleLinear()
      .domain([0, scheduledFlowControl.value.totalDuration])
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

    const contentGroup = chartContent.selectAll('.process-group').data(flowControlProcesses.value)

    const backgroundRect = contentGroup.selectAll('.process-background-rect').data((d) => [d])
    const processRect = contentGroup
      .selectAll<SVGRectElement, FlowControlProcess>('.process')
      .data((d) => [d])
    const startLine = contentGroup
      .selectAll<SVGLineElement, FlowControlProcess>('.start-line')
      .data((d) => [d])
    const endLine = contentGroup
      .selectAll<SVGLineElement, FlowControlProcess>('.end-line')
      .data((d) => [d])
    const deleteIconLine = contentGroup.selectAll('.delete-icon-line').data((d) => [d])
    const deleteIconCircle = contentGroup.selectAll('.delete-icon-circle').data((d) => [d])

    // Enter selection for creating new process groups
    const processEnter = contentGroup
      .enter()
      .append('g')
      .attr('class', 'process-group')
      .attr('id', (d) => `${props.id}-process-group-${d.id}`)
      .on('mouseenter', (event, d) => {
        select(`#${props.id}-delete-icon-${d.id}`).style('display', 'block')
      })
      .on('mouseleave', (event, d) => {
        select(`#${props.id}-delete-icon-${d.id}`).style('display', 'none')
      })

    processEnter
      .append('rect')
      .attr('class', 'process-background-rect')
      .style('visibility', 'hidden')
      .attr('x', x(0))
      .attr('y', (d) => y(d.id)!)
      .attr('width', width)
      .attr('height', y.bandwidth())

    processEnter
      .append('rect')
      .attr('class', 'process')
      .attr('id', (d) => `${props.id}-process-${d.id}`)
      .attr('x', (d) => x(d.startTime))
      .attr('y', (d) => y(d.id)!)
      .attr('width', (d) => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => (d.selected ? '#007bff' : '#BDBDBD'))
      .call(useDrag(props.id!, instances, width, marginX, scheduledFlowControl))
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
          zIndex: 3,
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
      if (isInstanceExisted) {
        const instance = instances.find(
          (i) => `${props.id}-process-${process.id}` === i.reference.getAttribute('id')
        )
        if (instance) {
          instance.setContent(useTooltipContent(process))
          if (process.selected) {
            instance.setProps({ trigger: 'manual' })
            instance.show()
            instance.setProps({ hideOnClick: false })
          } else {
            instance.hide()
            instance.setProps({ trigger: 'mouseenter' })
            instance.setProps({ hideOnClick: true })
          }
        }
      }
    }

    processRect.call(useDrag(props.id!, instances, width, marginX, scheduledFlowControl))

    processEnter
      .append('line')
      .attr('class', 'start-line')
      .attr('stroke-width', 5)
      .attr('stroke', 'transparent')
      .attr('id', (d) => `${props.id}-start-line-${d.id}`)
      .style('cursor', 'ew-resize')
      .attr('x1', (d) => x(d.startTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.startTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useLeftResize(props.id!, instances, marginX, scheduledFlowControl))

    processEnter
      .append('line')
      .attr('class', 'end-line')
      .attr('stroke-width', 5)
      .attr('stroke', 'transparent') // Color of the line
      .attr('id', (d) => `${props.id}-end-line-${d.id}`)
      .style('cursor', 'ew-resize')
      .attr('x1', (d) => x(d.endTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.endTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useRightResize(props.id!, instances, width, marginX, scheduledFlowControl))

    const iconGroup = processEnter
      .append('g')
      .attr('class', 'delete-icon')
      .attr('id', (d) => `${props.id}-delete-icon-${d.id}`)
      .style('cursor', 'pointer')
      .style('display', 'none')
      .on('click', (event, d) => {
        flowControlProcesses.value = flowControlProcesses.value.filter((p) => p.id !== d.id)
      })

    iconGroup
      .append('line')
      .attr('class', 'delete-icon-line')
      .attr('stroke-width', 1.5)
      .attr('stroke', 'grey')
      .attr('x1', (d) => x(d.endTime) + 6)
      .attr('y1', (d) => y(d.id)! + y.bandwidth() / 2)
      .attr('x2', (d) => x(d.endTime) + 14)
      .attr('y2', (d) => y(d.id)! + y.bandwidth() / 2)

    iconGroup
      .append('circle')
      .attr('class', 'delete-icon-circle')
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
      .merge(contentGroup.selectAll('.process-background-rect'))
      .transition()
      .attr('x', x(0))
      .attr('y', (d) => y(d.id)!)
      .attr('width', width)
      .attr('height', y.bandwidth())

    processRect
      .attr('x', (d) => x(d.startTime))
      .attr('y', (d) => y(d.id)!)
      .attr('width', (d) => x(d.endTime) - x(d.startTime))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => (d.selected ? '#007bff' : '#BDBDBD'))
      .call(useDrag(props.id!, instances, width, marginX, scheduledFlowControl))

    startLine
      .attr('x1', (d) => x(d.startTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.startTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useLeftResize(props.id!, instances, marginX, scheduledFlowControl))

    endLine
      .attr('x1', (d) => x(d.endTime))
      .attr('y1', (d) => y(d.id)!)
      .attr('x2', (d) => x(d.endTime))
      .attr('y2', (d) => y(d.id)! + y.bandwidth())
      .call(useRightResize(props.id!, instances, width, marginX, scheduledFlowControl))

    deleteIconLine
      .attr('x1', (d) => x(d.endTime) + 6)
      .attr('y1', (d) => y(d.id)! + y.bandwidth() / 2)
      .attr('x2', (d) => x(d.endTime) + 14)
      .attr('y2', (d) => y(d.id)! + y.bandwidth() / 2)

    deleteIconCircle
      .attr('cx', (d) => x(d.endTime) + 10)
      .attr('cy', (d) => y(d.id)! + y.bandwidth() / 2)
  }

  let oldFlowControlProcesses: FlowControlProcess[] = JSON.parse(
    JSON.stringify(flowControlProcesses.value)
  )

  watch(
    scheduledFlowControl,
    () => {
      updateProcess()
    },
    { deep: true, immediate: true }
  )

  watch(
    () => flowControlProcesses.value.length,
    (newValue, oldValue) => {
      if (newValue > oldValue) {
        oldFlowControlProcesses = JSON.parse(JSON.stringify(flowControlProcesses.value))
      } else if (newValue < oldValue) {
        const deletedProcess = oldFlowControlProcesses.find(
          (p) => !flowControlProcesses.value.some((np) => np.id === p.id)
        )
        if (deletedProcess) {
          const instance = instances.find(
            (i) => `${props.id}-process-${deletedProcess.id}` === i.reference.getAttribute('id')
          )
          if (instance) {
            instance.destroy()
            instances = instances.filter((i) => i !== instance)
          }
          oldFlowControlProcesses = JSON.parse(JSON.stringify(newValue))
        }
      }
    }
  )

  svgChart.node()
})
</script>
@/types/node
