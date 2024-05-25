import { drag } from 'd3-drag'
import { select } from 'd3-selection'
import type { Selection, BaseType } from 'd3-selection'
import type { FlowControlProcess } from '@/types/flowControl'
import type { D3DragEvent } from 'd3-drag'
import type { Instance } from 'tippy.js'
import { useTooltipContent } from '@/composables/useTooltipContent'
import type { Ref } from 'vue'
import { type StateController, ActionType } from '@/types/stateController'

let instance: Instance | undefined

function limitDrag(
  event: D3DragEvent<SVGRectElement, FlowControlProcess, any>,
  startOffsetX: number,
  marginX: number,
  chartWidth: number,
  processWidth: number
) {
  let x = event.x - startOffsetX
  const start = marginX
  const end = chartWidth - marginX - processWidth
  if (x <= start) {
    x = start
  }
  if (x >= end) {
    x = end
  }
  return x
}

function limitRightResize(
  event: D3DragEvent<SVGLineElement, FlowControlProcess, any>,
  width: number,
  marginX: number,
  id: string
) {
  let x = event.x
  const minimumDistance = Number(select(`#${id}-start-line-${event.subject.id}`).attr('x1')) + 10
  const end = width - marginX
  if (event.x >= end) {
    x = end
  }
  if (x <= minimumDistance) {
    x = minimumDistance
  }
  return x
}

function limitLeftResize(
  event: D3DragEvent<SVGLineElement, FlowControlProcess, any>,
  id: string,
  marginX: number
) {
  let x = event.x
  const minimumDistance = Number(select(`#${id}-end-line-${event.subject.id}`).attr('x1')) - 10
  const start = marginX
  if (event.x <= start) {
    x = start
  }
  if (x >= minimumDistance) {
    x = minimumDistance
  }
  return x
}

function updateContent(
  event:
    | D3DragEvent<SVGRectElement, FlowControlProcess, any>
    | D3DragEvent<SVGLineElement, FlowControlProcess, any>
) {
  instance?.setContent(useTooltipContent(event.subject))
  instance?.setProps({ trigger: 'mouseenter' })
  instance = undefined
}

export function useDrag(
  id: string,
  instances: Instance[],
  width: number,
  marginX: number,
  flowControlProcesses: Ref<FlowControlProcess[] | undefined>
) {
  const d3Drag = drag<SVGRectElement, FlowControlProcess, any>()

  let startOffsetX: number = 0
  let selection: Selection<BaseType, unknown, HTMLElement, any>
  let processWidth: number = 0

  d3Drag.on('start', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    selection = select(`#${id}-process-${event.subject.id}`)
    processWidth = Number(selection.attr('width'))
    const x = selection.attr('x')
    startOffsetX = event.x - Number(x)

    instance = instances.find(
      (instance) => instance.reference.id === `${id}-process-${event.subject.id}`
    )
    instance?.setProps({ trigger: 'manual' })
    instance?.show()
    select(`#${id}-delete-icon-${event.subject.id}`).style('display', 'none')
  })

  d3Drag.on('drag', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    const x = limitDrag(event, startOffsetX, marginX, width, processWidth)
    selection.attr('x', x)
    select(`#${id}-start-line-${event.subject.id}`).attr('x1', x).attr('x2', x)
    select(`#${id}-end-line-${event.subject.id}`)
      .attr('x1', x + processWidth)
      .attr('x2', x + processWidth)

    const startTime = ((x - marginX) / 10).toFixed(1)
    const endTime = ((x - marginX + processWidth) / 10).toFixed(1)
    instance?.setContent(`<div style="font-size: 10px;">${startTime} - ${endTime}</div>`)
  })

  d3Drag.on('end', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    const x = limitDrag(event, startOffsetX, marginX, width, processWidth)
    const startTime = ((x - marginX) / 10).toFixed(1)
    const endTime = ((x - marginX + processWidth) / 10).toFixed(1)
    event.subject.startTime = Number(startTime)
    event.subject.endTime = Number(endTime)
    if (flowControlProcesses.value) {
      const editedProcess: FlowControlProcess | undefined = flowControlProcesses.value.find(
        (p) => p.id === event.subject.id
      )
      if (editedProcess) {
        editedProcess.startTime = event.subject.startTime
        editedProcess.endTime = event.subject.endTime
        editedProcess.duration = event.subject.endTime - event.subject.startTime
      }
    }
    updateContent(event)
  })
  return d3Drag
}

export function useRightResize(
  id: string,
  instances: Instance[],
  width: number,
  marginX: number,
  flowControlProcesses: Ref<FlowControlProcess[] | undefined>
) {
  const d3RightResize = drag<SVGLineElement, FlowControlProcess, any>()

  d3RightResize.on('start', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    instance = instances.find(
      (instance) => instance.reference.id === `${id}-process-${event.subject.id}`
    )
    instance?.setProps({ trigger: 'manual' })
    instance?.show()
    select(`#${id}-delete-icon-${event.subject.id}`).style('display', 'none')
  })

  d3RightResize.on('drag', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    const x = limitRightResize(event, width, marginX, id)
    select(`#${id}-end-line-${event.subject.id}`).attr('x1', x).attr('x2', x)
    select(`#${id}-process-${event.subject.id}`).attr(
      'width',
      x - Number(select(`#${id}-start-line-${event.subject.id}`).attr('x1'))
    )

    const endTime = ((x - marginX) / 10).toFixed(1)
    instance?.setContent(
      `<div style="font-size: 10px;">${event.subject.startTime} - ${endTime}</div>`
    )
  })

  d3RightResize.on('end', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    const x = limitRightResize(event, width, marginX, id)
    const endTime = ((x - marginX) / 10).toFixed(1)
    event.subject.endTime = Number(endTime)
    event.subject.duration = event.subject.endTime - event.subject.startTime
    if (flowControlProcesses.value) {
      const editedProcess: FlowControlProcess | undefined = flowControlProcesses.value.find(
        (p) => p.id === event.subject.id
      )
      if (editedProcess) {
        editedProcess.startTime = event.subject.endTime - event.subject.duration
        editedProcess.endTime = event.subject.endTime
        editedProcess.duration = event.subject.duration
      }
    }
    updateContent(event)
  })
  return d3RightResize
}

export function useLeftResize(
  id: string,
  instances: Instance[],
  marginX: number,
  flowControlProcesses: Ref<FlowControlProcess[] | undefined>
) {
  const d3LeftResize = drag<SVGLineElement, FlowControlProcess, any>()

  d3LeftResize.on('start', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    instance = instances.find(
      (instance) => instance.reference.id === `${id}-process-${event.subject.id}`
    )
    instance?.setProps({ trigger: 'manual' })
    instance?.show()
    select(`#${id}-delete-icon-${event.subject.id}`).style('display', 'none')
  })

  d3LeftResize.on('drag', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    const x = limitLeftResize(event, id, marginX)
    select(`#${id}-start-line-${event.subject.id}`).attr('x1', x).attr('x2', x)
    select(`#${id}-process-${event.subject.id}`)
      .attr('x', x)
      .attr('width', Number(select(`#${id}-end-line-${event.subject.id}`).attr('x1')) - x)

    const startTime = ((x - marginX) / 10).toFixed(1)
    instance?.setContent(
      `<div style="font-size: 10px;">${startTime} - ${event.subject.endTime}</div>`
    )
  })

  d3LeftResize.on('end', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    const x = limitLeftResize(event, id, marginX)
    const startTime = ((x - marginX) / 10).toFixed(1)
    event.subject.startTime = Number(startTime)
    event.subject.duration = event.subject.endTime - event.subject.startTime
    if (flowControlProcesses.value) {
      const editedProcess: FlowControlProcess | undefined = flowControlProcesses.value.find(
        (p) => p.id === event.subject.id
      )
      if (editedProcess) {
        editedProcess.startTime = event.subject.startTime
        editedProcess.endTime = event.subject.startTime + event.subject.duration
        editedProcess.duration = event.subject.duration
      }
    }
    updateContent(event)
  })

  return d3LeftResize
}
