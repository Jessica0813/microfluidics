import { drag, select } from 'd3'
import { type D3DragEvent } from 'd3-drag'
import { type Sensor } from '@/types/sensor'
import { type Ref } from 'vue'
import { useSensorStore } from '@/stores/useSensorStore'

export function d3Drag(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors } = useSensorStore()
  const d3Drag = drag<SVGGElement, Sensor, any>()
  let startOffsetX: number = 0
  let startOffsetY: number = 0
  d3Drag.on('start', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    isDragging.value = true
    startOffsetX = event.x - event.subject.position.x
    startOffsetY = event.y - event.subject.position.y
    select('body').style('cursor', 'grabbing')
  })
  d3Drag.on('drag', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    select(`#sensor-${event.subject.id}`)
      .select('.sensor')
      .attr('cx', event.x - startOffsetX)
      .attr('cy', event.y - startOffsetY)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-label')
      .attr('x', event.x - startOffsetX)
      .attr('y', event.y - startOffsetY)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-rect')
      .attr('x', event.x - startOffsetX - event.subject.radius)
      .attr('y', event.y - startOffsetY - event.subject.radius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-left-dot')
      .attr('cx', event.x - startOffsetX - event.subject.radius)
      .attr('cy', event.y - startOffsetY - event.subject.radius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-right-dot')
      .attr('cx', event.x - startOffsetX + event.subject.radius)
      .attr('cy', event.y - startOffsetY - event.subject.radius)
    select(`#sensor-${event.subject.id}`)
      .select('.lower-left-dot')
      .attr('cx', event.x - startOffsetX - event.subject.radius)
      .attr('cy', event.y - startOffsetY + event.subject.radius)
    select(`#sensor-${event.subject.id}`)
      .select('.lower-right-dot')
      .attr('cx', event.x - startOffsetX + event.subject.radius)
      .attr('cy', event.y - startOffsetY + event.subject.radius)
  })
  d3Drag.on('end', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    editSensor(event.subject.id, {
      position: {
        x: event.x - startOffsetX,
        y: event.y - startOffsetY
      }
    })
    select('body').style('cursor', 'default')
    isDragging.value = false
  })
  return d3Drag
}

let startPositionX = 0
let originalRadius = 0
let updatedRadius = 0

export function d3UpperLeftResize(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors } = useSensorStore()
  const d3UpperLeftResize = drag<SVGCircleElement, Sensor, any>()
  d3UpperLeftResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    isDragging.value = true
    select('body').style('cursor', 'nwse-resize')
    originalRadius = event.subject.radius
    startPositionX = event.x
  })
  d3UpperLeftResize.on('drag', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    updatedRadius = originalRadius + (startPositionX - event.x) / 2
    select(`#sensor-${event.subject.id}`)
      .select('.sensor')
      .attr('r', updatedRadius)
      .attr('cx', event.x + updatedRadius)
      .attr('cy', event.y + updatedRadius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-left-dot')
      .attr('cx', event.x)
      .attr('cy', event.y)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-rect')
      .attr('x', event.x)
      .attr('y', event.y)
      .attr('width', updatedRadius * 2)
      .attr('height', updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-label')
      .attr('x', event.x + updatedRadius)
      .attr('y', event.y + updatedRadius)
      .attr('dy', -updatedRadius - 5)

    select(`#sensor-${event.subject.id}`)
      .select('.upper-right-dot')
      .attr('cx', event.x + updatedRadius * 2)
      .attr('cy', event.y)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-left-dot')
      .attr('cx', event.x)
      .attr('cy', event.y + updatedRadius * 2)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-right-dot')
      .attr('cx', event.x + updatedRadius * 2)
      .attr('cy', event.y + updatedRadius * 2)
  })
  d3UpperLeftResize.on('end', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    editSensor(event.subject.id, {
      position: {
        x: event.x + updatedRadius,
        y: event.y + updatedRadius
      },
      radius: updatedRadius
    })

    select('body').style('cursor', 'default')
    isDragging.value = false
  })

  return d3UpperLeftResize
}

export function d3UpperRightResize(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors } = useSensorStore()
  const d3UpperRightResize = drag<SVGCircleElement, Sensor, any>()
  d3UpperRightResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    isDragging.value = true
    select('body').style('cursor', 'nesw-resize')
    originalRadius = event.subject.radius
    startPositionX = event.x
  })
  d3UpperRightResize.on('drag', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    updatedRadius = originalRadius + (event.x - startPositionX) / 2
    select(`#sensor-${event.subject.id}`)
      .select('.sensor')
      .attr('r', updatedRadius)
      .attr('cx', event.x - updatedRadius)
      .attr('cy', event.y + updatedRadius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-left-dot')
      .attr('cx', event.x - updatedRadius * 2)
      .attr('cy', event.y)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-rect')
      .attr('x', event.x - updatedRadius * 2)
      .attr('y', event.y)
      .attr('width', updatedRadius * 2)
      .attr('height', updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-label')
      .attr('x', event.x - updatedRadius)
      .attr('y', event.y + updatedRadius)
      .attr('dy', -updatedRadius - 5)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-right-dot')
      .attr('cx', event.x)
      .attr('cy', event.y)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-left-dot')
      .attr('cx', event.x - updatedRadius * 2)
      .attr('cy', event.y + updatedRadius * 2)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-right-dot')
      .attr('cx', event.x)
      .attr('cy', event.y + updatedRadius * 2)
  })
  d3UpperRightResize.on('end', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    editSensor(event.subject.id, {
      position: {
        x: event.x - updatedRadius,
        y: event.y + updatedRadius
      },
      radius: updatedRadius
    })

    select('body').style('cursor', 'default')
    isDragging.value = false
  })
  return d3UpperRightResize
}

export function d3LowerLeftResize(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors } = useSensorStore()
  const d3LowerLeftResize = drag<SVGCircleElement, Sensor, any>()
  d3LowerLeftResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    isDragging.value = true
    select('body').style('cursor', 'nesw-resize')
    originalRadius = event.subject.radius
    startPositionX = event.x
  })
  d3LowerLeftResize.on('drag', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    updatedRadius = originalRadius + (startPositionX - event.x) / 2
    select(`#sensor-${event.subject.id}`)
      .select('.sensor')
      .attr('r', updatedRadius)
      .attr('cx', event.x + updatedRadius)
      .attr('cy', event.y - updatedRadius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-left-dot')
      .attr('cx', event.x)
      .attr('cy', event.y - updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-rect')
      .attr('x', event.x)
      .attr('y', event.y - updatedRadius * 2)
      .attr('width', updatedRadius * 2)
      .attr('height', updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-label')
      .attr('x', event.x + updatedRadius)
      .attr('y', event.y - updatedRadius)
      .attr('dy', -updatedRadius - 5)

    select(`#sensor-${event.subject.id}`)
      .select('.upper-right-dot')
      .attr('cx', event.x + updatedRadius * 2)
      .attr('cy', event.y - updatedRadius * 2)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-left-dot')
      .attr('cx', event.x)
      .attr('cy', event.y)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-right-dot')
      .attr('cx', event.x + updatedRadius * 2)
      .attr('cy', event.y)
  })
  d3LowerLeftResize.on('end', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    editSensor(event.subject.id, {
      position: {
        x: event.x + updatedRadius,
        y: event.y - updatedRadius
      },
      radius: updatedRadius
    })

    select('body').style('cursor', 'default')
    isDragging.value = false
  })
  return d3LowerLeftResize
}

export function d3LowerRightResize(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors } = useSensorStore()
  const d3LowerRightResize = drag<SVGCircleElement, Sensor, any>()
  d3LowerRightResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    isDragging.value = true
    select('body').style('cursor', 'nwse-resize')
    originalRadius = event.subject.radius
    startPositionX = event.x
  })
  d3LowerRightResize.on('drag', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    updatedRadius = originalRadius + (event.x - startPositionX) / 2
    select(`#sensor-${event.subject.id}`)
      .select('.sensor')
      .attr('r', updatedRadius)
      .attr('cx', event.x - updatedRadius)
      .attr('cy', event.y - updatedRadius)
    select(`#sensor-${event.subject.id}`)
      .select('.upper-left-dot')
      .attr('cx', event.x - updatedRadius * 2)
      .attr('cy', event.y - updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-rect')
      .attr('x', event.x - updatedRadius * 2)
      .attr('y', event.y - updatedRadius * 2)
      .attr('width', updatedRadius * 2)
      .attr('height', updatedRadius * 2)
    select(`#sensor-${event.subject.id}`)
      .select('.sensor-label')
      .attr('x', event.x - updatedRadius)
      .attr('y', event.y - updatedRadius)
      .attr('dy', -updatedRadius - 5)

    select(`#sensor-${event.subject.id}`)
      .select('.upper-right-dot')
      .attr('cx', event.x)
      .attr('cy', event.y - updatedRadius * 2)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-left-dot')
      .attr('cx', event.x - updatedRadius * 2)
      .attr('cy', event.y)

    select(`#sensor-${event.subject.id}`)
      .select('.lower-right-dot')
      .attr('cx', event.x)
      .attr('cy', event.y)
  })
  d3LowerRightResize.on('end', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    editSensor(event.subject.id, {
      position: {
        x: event.x - updatedRadius,
        y: event.y - updatedRadius
      },
      radius: updatedRadius
    })

    select('body').style('cursor', 'default')
    isDragging.value = false
  })
  return d3LowerRightResize
}
