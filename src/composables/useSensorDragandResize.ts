import { drag, select } from 'd3'
import { type D3DragEvent } from 'd3-drag'
import { type Sensor } from '@/types/sensor'
import { useSensorStore } from '@/stores/useSensorStore'
import { useSensorCanvasStore } from '@/stores/useSensorCanvasStore'
import { storeToRefs } from 'pinia'

export function d3Drag() {
  const { editSensor, editMultiSensors, onSelectSensor, toggleIsMetaKeyPressed } = useSensorStore()
  const { setDragging } = useSensorCanvasStore()
  const { selectedSensors } = storeToRefs(useSensorStore())
  const d3Drag = drag<SVGGElement, Sensor, any>()
  let startOffsetX: number = 0
  let startOffsetY: number = 0
  let offsetXList: number[] = []
  let offsetYList: number[] = []
  let isClicking = false
  d3Drag.on('start', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    isClicking = true
    setDragging()
    select('body').style('cursor', 'grabbing')

    if (event.sourceEvent.metaKey || event.sourceEvent.ctrlKey) {
      toggleIsMetaKeyPressed()
    }

    // check if the sensor is already selected
    const sensorIndex = selectedSensors.value.findIndex((sensor) => sensor.id === event.subject.id)
    if (sensorIndex === -1) {
      onSelectSensor(event.subject.id)
    }

    startOffsetX = event.x - event.subject.position.x
    startOffsetY = event.y - event.subject.position.y

    for (let i = 0; i < selectedSensors.value.length; i++) {
      if (selectedSensors.value[i] === event.subject.id) {
        continue
      }
      offsetXList.push(event.x - selectedSensors.value[i].position.x)
      offsetYList.push(event.y - selectedSensors.value[i].position.y)
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

    for (let i = 0; i < selectedSensors.value.length; i++) {
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.sensor')
        .attr('cx', event.x - offsetXList[i])
        .attr('cy', event.y - offsetYList[i])
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.sensor-label')
        .attr('x', event.x - offsetXList[i])
        .attr('y', event.y - offsetYList[i])
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.sensor-rect')
        .attr('x', event.x - offsetXList[i] - selectedSensors.value[i].radius)
        .attr('y', event.y - offsetYList[i] - selectedSensors.value[i].radius)
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.upper-left-dot')
        .attr('cx', event.x - offsetXList[i] - selectedSensors.value[i].radius)
        .attr('cy', event.y - offsetYList[i] - selectedSensors.value[i].radius)
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.upper-right-dot')
        .attr('cx', event.x - offsetXList[i] + selectedSensors.value[i].radius)
        .attr('cy', event.y - offsetYList[i] - selectedSensors.value[i].radius)
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.lower-left-dot')
        .attr('cx', event.x - offsetXList[i] - selectedSensors.value[i].radius)
        .attr('cy', event.y - offsetYList[i] + selectedSensors.value[i].radius)
      select(`#sensor-${selectedSensors.value[i].id}`)
        .select('.lower-right-dot')
        .attr('cx', event.x - offsetXList[i] + selectedSensors.value[i].radius)
        .attr('cy', event.y - offsetYList[i] + selectedSensors.value[i].radius)
    }
  })
  d3Drag.on('end', (event: D3DragEvent<SVGGElement, Sensor, any>) => {
    if (isClicking) {
      isClicking = false
      startOffsetX = 0
      startOffsetY = 0
      offsetXList = []
      offsetYList = []
      setDragging()
      select('body').style('cursor', 'default')
      return
    }

    if (selectedSensors.value.length <= 1) {
      editSensor(event.subject.id, {
        position: {
          x: event.x - startOffsetX,
          y: event.y - startOffsetY
        }
      })
    } else {
      const idList = selectedSensors.value.map((sensor) => sensor.id)
      const updatedPosition = selectedSensors.value.map((sensor, index) => {
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
    setDragging()
    select('body').style('cursor', 'default')
  })
  return d3Drag
}

let startPositionX = 0
let originalRadius = 0
let updatedRadius = 0

export function d3UpperLeftResize() {
  const { editSensor } = useSensorStore()
  const { setDragging } = useSensorCanvasStore()
  const d3UpperLeftResize = drag<SVGCircleElement, Sensor, any>()
  d3UpperLeftResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    setDragging()
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
    setDragging()
  })

  return d3UpperLeftResize
}

export function d3UpperRightResize() {
  const { editSensor } = useSensorStore()
  const { setDragging } = useSensorCanvasStore()
  const d3UpperRightResize = drag<SVGCircleElement, Sensor, any>()
  d3UpperRightResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    setDragging()
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
    setDragging()
  })
  return d3UpperRightResize
}

export function d3LowerLeftResize() {
  const { editSensor } = useSensorStore()
  const { setDragging } = useSensorCanvasStore()
  const d3LowerLeftResize = drag<SVGCircleElement, Sensor, any>()
  d3LowerLeftResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    setDragging()
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
    setDragging()
  })
  return d3LowerLeftResize
}

export function d3LowerRightResize() {
  const { editSensor } = useSensorStore()
  const { setDragging } = useSensorCanvasStore()
  const d3LowerRightResize = drag<SVGCircleElement, Sensor, any>()
  d3LowerRightResize.on('start', (event: D3DragEvent<SVGCircleElement, Sensor, any>) => {
    setDragging()
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
    setDragging()
  })
  return d3LowerRightResize
}
