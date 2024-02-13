import { drag } from 'd3-drag'
import { select } from 'd3-selection'
import type { FlowControlProcess } from '@/types/flowControl'
import type { D3DragEvent } from 'd3-drag'
import type { Instance } from 'tippy.js'

let instance: Instance | undefined

function updateProcess(  event:
  | D3DragEvent<SVGRectElement, FlowControlProcess, any>
  | D3DragEvent<SVGLineElement, FlowControlProcess, any>,
  id: string) {
    
  }

function updateContent(
  event:
    | D3DragEvent<SVGRectElement, FlowControlProcess, any>
    | D3DragEvent<SVGLineElement, FlowControlProcess, any>
) {
  instance?.setContent(`<div style="font-size: 10px;">
          Duration: ${event.subject.startTime}-${event.subject.endTime}<br>
          Inlet: ${event.subject.inlet}<br>
          Injection: ${event.subject.injection}<br>
          Fluid: ${event.subject.fluid}<br>
          Pressure: ${event.subject.pressure}
          </div>`)
  instance?.setProps({ trigger: 'mouseenter' })
  instance = undefined
}

export function useDrag(id: string, instances: Instance[], width: number, marginX: number) {
  const d3Drag = drag<SVGRectElement, FlowControlProcess, any>()
  let startOffsetX: number = 0
  d3Drag.on('start', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    instance = instances.find(
      (instance) => instance.reference.id === `${id}-process-${event.subject.id}`
    )
    instance?.setProps({ trigger: 'manual' })
    instance?.show()
    const x = select(`#${id}-process-${event.subject.id}`).attr('x')
    startOffsetX = event.x - Number(x)
    select(`#${id}-delete-icon-${event.subject.id}`).style('display', 'none')
  })
  d3Drag.on('drag', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    const selection = select(`#${id}-process-${event.subject.id}`)
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
    select(`#${id}-start-line-${event.subject.id}`).attr('x1', x).attr('x2', x)
    select(`#${id}-end-line-${event.subject.id}`)
      .attr('x1', x + Number(selection.attr('width')))
      .attr('x2', x + Number(selection.attr('width')))

    const startTime = ((x - marginX) / 10).toFixed(1)
    const endTime = ((x - marginX + Number(selection.attr('width'))) / 10).toFixed(1)
    instance?.setContent(`<div style="font-size: 10px;">${startTime} - ${endTime}</div>`)
  })
  d3Drag.on('end', (event: D3DragEvent<SVGRectElement, FlowControlProcess, any>) => {
    updateContent(event)
  })
  return d3Drag
}

export function useRightResize(id: string, instances: Instance[], width: number, marginX: number) {
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
    let x = event.x
    const minimumDistance = Number(select(`#${id}-start-line-${event.subject.id}`).attr('x1')) + 10
    const end = width - marginX
    if (event.x >= end) {
      x = end
    }
    if (x <= minimumDistance) {
      x = minimumDistance
    }
    select(`#${id}-end-line-${event.subject.id}`).attr('x1', x).attr('x2', x)
    select(`#${id}-process-${event.subject.id}`).attr(
      'width',
      x - Number(select(`#${id}-start-line-${event.subject.id}`).attr('x1'))
    )
    const endTime = ((x - marginX) / marginX).toFixed(1)
    instance?.setContent(
      `<div style="font-size: 10px;">${event.subject.startTime} - ${endTime}</div>`
    )
  })
  d3RightResize.on('end', (event: D3DragEvent<SVGLineElement, FlowControlProcess, any>) => {
    updateContent(event)
  })
  return d3RightResize
}

export function useLeftResize(id: string, instances: Instance[], marginX: number) {
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
    let x = event.x
    const minimumDistance = Number(select(`#${id}-end-line-${event.subject.id}`).attr('x1')) - 10
    const start = 17
    if (event.x <= start) {
      x = start
    }
    if (x >= minimumDistance) {
      x = minimumDistance
    }
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
    updateContent(event)
  })

  return d3LeftResize
}
