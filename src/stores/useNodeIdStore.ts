import { defineStore } from 'pinia'

export const useNodeIdStore = defineStore('nodeId', () => {
  let processNodeIndex = 1
  let pauseNodeIndex = 1
  let conditionNodeIndex = 1
  let scheduleNodeIndex = 1
  let subProcessIndex = 1

  let edgeIndex = 1

  function getProcessNodeId() {
    return `process_${processNodeIndex++}`
  }

  function getPauseNodeId() {
    return `pause_${pauseNodeIndex++}`
  }

  function getConditionNodeId() {
    return `condition_${conditionNodeIndex++}`
  }

  function getProcessScheduleNodeId() {
    return `schedule_${scheduleNodeIndex++}`
  }

  function getSubProcessId() {
    return `${subProcessIndex++}`
  }

  function getEdgeId() {
    return `edge_${edgeIndex++}`
  }

  function getIndexes() {
    return {
      processNodeIndex: processNodeIndex,
      pauseNodeIndex: pauseNodeIndex,
      conditionNodeIndex: conditionNodeIndex,
      scheduleNodeIndex: scheduleNodeIndex,
      subProcessIndex: subProcessIndex,
      edgeIndex: edgeIndex
    }
  }

  function initIndexes(indexes: {
    initalProcessNodeIndex: number
    initalpauseNodeIndex: number
    initalconditionNodeIndex: number
    initalscheduleNodeIndex: number
    initalsubProcessIndex: number
    initaledgeIndex: number
  }) {
    processNodeIndex = indexes.initalProcessNodeIndex
    pauseNodeIndex = indexes.initalpauseNodeIndex
    conditionNodeIndex = indexes.initalconditionNodeIndex
    scheduleNodeIndex = indexes.initalscheduleNodeIndex
    subProcessIndex = indexes.initalsubProcessIndex
    edgeIndex = indexes.initaledgeIndex
  }

  return {
    getProcessNodeId,
    getPauseNodeId,
    getConditionNodeId,
    getProcessScheduleNodeId,
    getSubProcessId,
    getEdgeId,
    getIndexes,
    initIndexes
  }
})
