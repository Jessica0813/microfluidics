import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import { select } from 'd3-selection'
import type { Ref } from 'vue'
import { useSensorStore } from './useSensor'

interface UseDragParams {
  id: string
  el: Ref<HTMLElement | null>
}

export function useDrag(params: UseDragParams) {
  const { id, el } = params
  const { editSensor } = useSensorStore()
  if (!el.value) return

  const d3Drag = drag()
  let startOffsetX: number
  let startOffsetY: number
  const dragItem = el.value.getBoundingClientRect()
  d3Drag.on('start', (event: D3DragEvent<HTMLElement, any, any>) => {
    startOffsetX = event.x - dragItem.x
    startOffsetY = event.y - dragItem.y
  })
  d3Drag.on('drag', (event: D3DragEvent<HTMLElement, any, any>) => {
    if (!el.value) return
    el.value.style.left = `${event.x - startOffsetX}px`
    el.value.style.top = `${event.y - startOffsetY}px`
  })
  d3Drag.on('end', (event: D3DragEvent<HTMLElement, any, any>) => {
    // update sensor position
    editSensor(id, {
      position: {
        x: event.x - startOffsetX,
        y: event.y - startOffsetY
      }
    })
  })
  const draggable = select(el.value).call(d3Drag)
  return draggable
}
