import { defineStore } from 'pinia'

export const useNodeIdStore = defineStore('nodeId', () => {
  let processNodeId = 1
  let pauseNodeId = 1
  let conditionNodeId = 1
  let processScheduleNodeId = 1
  let subProcessId = 1

  let edgeId = 1
  let edgeTrueId = 1
  let edgeFalseId = 1

  function getProcessNodeId() {
    return `process_${processNodeId++}`
  }

  function getPauseNodeId() {
    return `pause_${pauseNodeId++}`
  }

  function getConditionNodeId() {
    return `condition_${conditionNodeId++}`
  }

  function getProcessScheduleNodeId() {
    return `schedule_${processScheduleNodeId++}`
  }

  function getSubProcessId() {
    return `${subProcessId++}`
  }

  function getEdgeId() {
    return `edge_${edgeId++}`
  }

  function getEdgeTrueId() {
    return `edgeTrue_${edgeTrueId++}`
  }

  function getEdgeFalseId() {
    return `edgeFalse_${edgeFalseId++}`
  }

  return {
    getProcessNodeId,
    getPauseNodeId,
    getConditionNodeId,
    getProcessScheduleNodeId,
    getSubProcessId,
    getEdgeId,
    getEdgeTrueId,
    getEdgeFalseId
  }
})
