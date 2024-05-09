import { type StateController, ActionType } from '@/types/stateController'
import type { Node } from '@vue-flow/core'
import type { GraphNode, GraphEdge, RemoveNodes, RemoveEdges } from '@vue-flow/core'

export function createDeleteNodeState(
  getSelectedNodes: GraphNode<any, any, string>[],
  connectedEdges: GraphEdge<any, any, string>[],
  removeNodes: RemoveNodes,
  removeEdges: RemoveEdges
) {
  if (connectedEdges.length > 0) {
    const state: StateController = {
      type: ActionType.DELETE_MULTI_ElEMENTS,
      name: 'delete multiple elements',
      objectId: [],
      oldState: [],
      newState: []
    }
    connectedEdges.forEach((edge) => {
      if (edge && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
        state.objectId.push(edge.id)
        state.oldState.push({
          data: '',
          source: edge.source,
          target: edge.target,
          sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
          targetHandleId: edge.targetHandle ? edge.targetHandle : ''
        })
        removeEdges([edge])
      }
    })
    const node = getSelectedNodes[0]
    if (Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(node.id)
      state.oldState.push({
        objectPosition: node.position,
        objectType: node.type,
        data: node.data.flowControl || node.data.condition || node.data.scheduledFlowControl
      })
      removeNodes([node])
    }
    return state
  }
  const node = getSelectedNodes[0]
  if (node) {
    const state: StateController = {
      type: ActionType.DELETE_NODE,
      name: 'delete node ' + node.id,
      objectId: node.id,
      oldState: {
        objectPosition: node.position,
        objectType: node.type,
        data: node.data.flowControl || node.data.condition || node.data.scheduledFlowControl
      }
    }
    removeNodes([node])
    return state
  }
}

export function createDeleteEdgeState(getSelectedEdges: GraphEdge[], removeEdges: RemoveEdges) {
  const edge = getSelectedEdges[0]
  if (edge) {
    const state: StateController = {
      type: ActionType.DELETE_EDGE,
      name: 'delete edge ' + edge.id,
      objectId: edge.id,
      oldState: {
        data: '',
        source: edge.source,
        target: edge.target,
        sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
        targetHandleId: edge.targetHandle ? edge.targetHandle : ''
      }
    }
    removeEdges([edge])
    return state
  }
}

export function createDeleteMultiEdgesState(
  getSelectedEdges: GraphEdge[],
  removeEdges: RemoveEdges
) {
  const state: StateController = {
    type: ActionType.DELETE_MULTI_ElEMENTS,
    name: 'delete multiple elements',
    objectId: [],
    oldState: [],
    newState: []
  }
  getSelectedEdges.forEach((edge) => {
    if (edge && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(edge.id)
      state.oldState.push({
        data: '',
        source: edge.source,
        target: edge.target,
        sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
        targetHandleId: edge.targetHandle ? edge.targetHandle : ''
      })
      removeEdges([edge])
    }
  })
  if (state.objectId.length > 0) {
    return state
  }
}

export function createDeleteMultiNodesState(
  getSelectedNodes: GraphNode<any, any, string>[],
  getSelectedEdges: GraphEdge[],
  removeNodes: RemoveNodes,
  removeEdges: RemoveEdges,
  getConnectedEdges: (nodesOrId: string | Node<any, any, string>[]) => GraphEdge[]
) {
  let connectedEdges = getConnectedEdges(getSelectedNodes)
  const state: StateController = {
    type: ActionType.DELETE_MULTI_ElEMENTS,
    name: 'delete multiple elements',
    objectId: [],
    oldState: [],
    newState: []
  }
  if (getSelectedEdges.length > 0) {
    getSelectedEdges.forEach((edge) => {
      if (edge && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
        connectedEdges = connectedEdges.filter((item) => item !== edge)
        state.objectId.push(edge.id)
        state.oldState.push({
          data: '',
          source: edge.source,
          target: edge.target,
          sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
          targetHandleId: edge.targetHandle ? edge.targetHandle : ''
        })
        removeEdges([edge])
      }
    })
  }
  connectedEdges.forEach((edge) => {
    if (edge && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(edge.id)
      state.oldState.push({
        data: '',
        source: edge.source,
        target: edge.target,
        sourceHandleId: edge.sourceHandle ? edge.sourceHandle : '',
        targetHandleId: edge.targetHandle ? edge.targetHandle : ''
      })
      removeEdges([edge])
    }
  })
  getSelectedNodes.forEach((node) => {
    if (node && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
      state.objectId.push(node.id)
      state.oldState.push({
        objectPosition: node.position,
        objectType: node.type,
        data: node.data.flowControl || node.data.condition || node.data.scheduledFlowControl
      })
      removeNodes([node])
    }
  })
  if (state.objectId.length > 0) {
    return state
  }
}
