import { drag } from 'd3-drag'
import { select } from 'd3-selection'
// import type { Selection, BaseType } from 'd3-selection'
import type { D3DragEvent } from 'd3-drag'

export function useDrag(pos: { x: number; y: number }, isDraggable: boolean) {
  const d3Drag = drag<HTMLDivElement, any, any>()
  let startOffsetX: number = 0
  let startOffsetY: number = 0
  let x: number = 0
  let y: number = 0
  d3Drag.on('start', (event: D3DragEvent<HTMLDivElement, any, any>) => {
    event.sourceEvent.preventDefault()
    console.log(event)
    startOffsetX = event.x - pos.x
    startOffsetY = event.y - pos.y
  })
  d3Drag.on('drag', (event: D3DragEvent<HTMLDivElement, any, any>) => {
    x = event.x - startOffsetX
    y = event.y - startOffsetY
    // select('#dragIcon').style('transform', `translate(${x}px, ${y}px)`)
    select('#menu-bar').style('top', `${y}px`).style('left', `${x}px`)
  })
  d3Drag.on('end', (event: D3DragEvent<HTMLDivElement, any, any>) => {
    event.sourceEvent.preventDefault()
    pos.x = x
    pos.y = y
  })
  d3Drag.filter(() => isDraggable)
  return d3Drag
}
