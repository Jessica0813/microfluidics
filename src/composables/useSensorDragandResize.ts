import { drag, select } from 'd3'
import { type D3DragEvent } from 'd3-drag'
import { type Sensor } from '@/types/sensor'
import { type Ref } from 'vue'
import { useSensorStore } from '@/stores/useSensorStore'

export function d3Drag(isDragging: Ref<boolean>) {
  const { editSensor, getSelectedSensors, editMultiSensors } = useSensorStore()
  const d3Drag = drag<SVGGElement, Sensor, any>()
  let startOffsetX: number = 0
  let startOffsetY: number = 0
  let offsetXList: number[] = []
  let offsetYList: number[] = []
  let isClicking = false
  d3Drag.on('start', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    isClicking = true
    isDragging.value = true
    select('body').style('cursor', 'grabbing')

    startOffsetX = event.x - event.subject.position.x
    startOffsetY = event.y - event.subject.position.y

    for (let i = 0; i < getSelectedSensors().length; i++) {
      if (getSelectedSensors()[i] === event.subject.id) {
        continue
      }
      offsetXList.push(event.x - getSelectedSensors()[i].position.x)
      offsetYList.push(event.y - getSelectedSensors()[i].position.y)
    }
  })
  d3Drag.on('drag', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    isClicking = false
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

    for (let i = 0; i < getSelectedSensors().length; i++) {
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.sensor')
        .attr('cx', event.x - offsetXList[i])
        .attr('cy', event.y - offsetYList[i])
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.sensor-label')
        .attr('x', event.x - offsetXList[i])
        .attr('y', event.y - offsetYList[i])
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.sensor-rect')
        .attr('x', event.x - offsetXList[i] - getSelectedSensors()[i].radius)
        .attr('y', event.y - offsetYList[i] - getSelectedSensors()[i].radius)
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.upper-left-dot')
        .attr('cx', event.x - offsetXList[i] - getSelectedSensors()[i].radius)
        .attr('cy', event.y - offsetYList[i] - getSelectedSensors()[i].radius)
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.upper-right-dot')
        .attr('cx', event.x - offsetXList[i] + getSelectedSensors()[i].radius)
        .attr('cy', event.y - offsetYList[i] - getSelectedSensors()[i].radius)
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.lower-left-dot')
        .attr('cx', event.x - offsetXList[i] - getSelectedSensors()[i].radius)
        .attr('cy', event.y - offsetYList[i] + getSelectedSensors()[i].radius)
      select(`#sensor-${getSelectedSensors()[i].id}`)
        .select('.lower-right-dot')
        .attr('cx', event.x - offsetXList[i] + getSelectedSensors()[i].radius)
        .attr('cy', event.y - offsetYList[i] + getSelectedSensors()[i].radius)
    }
  })
  d3Drag.on('end', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    if (isClicking) {
      isClicking = false
      startOffsetX = 0
      startOffsetY = 0
      offsetXList = []
      offsetYList = []
      isDragging.value = false
      select('body').style('cursor', 'default')
      return
    }

    if (getSelectedSensors().length <= 1) {
      editSensor(event.subject.id, {
        position: {
          x: event.x - startOffsetX,
          y: event.y - startOffsetY
        }
      })
    } else {
      const idList = getSelectedSensors().map((sensor) => sensor.id)
      const updatedPosition = getSelectedSensors().map((sensor, index) => {
        return {
          position: {
            x: event.x - offsetXList[index],
            y: event.y - offsetYList[index]
          }
        }
      })
      editMultiSensors(idList, updatedPosition)
    }

    startOffsetX = 0
    startOffsetY = 0
    offsetXList = []
    offsetYList = []
    isDragging.value = false
    select('body').style('cursor', 'default')
  })
  return d3Drag
}

let startPositionX = 0
let originalRadius = 0
let updatedRadius = 0

export function d3UpperLeftResize(isDragging: Ref<boolean>) {
  const { editSensor } = useSensorStore()
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
  const { editSensor } = useSensorStore()
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
  const { editSensor } = useSensorStore()
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
  const { editSensor } = useSensorStore()
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
