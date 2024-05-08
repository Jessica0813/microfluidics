import { type StateController, ActionType } from '@/types/stateController'
import type { Node } from '@vue-flow/core'
import type { GraphNode, GraphEdge, RemoveNodes, RemoveEdges, FindNode } from '@vue-flow/core'

export function createState(node: Node, type: ActionType) {
  let name: string = ''
  switch (type) {
    case ActionType.CREATE_NODE:
      name = 'create node ' + node.id
      break
    case ActionType.DELETE_NODE:
      name = 'delete node ' + node.id
      break
    case ActionType.MOVE_NODE:
      name = 'move node ' + node.id
      break
    case ActionType.UPDATE_NODE_DATA:
      name = 'update node data ' + node.id
      break
  }
  const state: StateController = {
    type: type,
    name: name,
    objectId: node.id,
    oldState: {
      objectPosition: node.position,
      objectType: node.type,
      data: node.data
    }
  }

  return state
}

export function createDeleteNodeState(
  getSelectedNodes: GraphNode<any, any, string>[],
  connectedEdges: GraphEdge<any, any, string>[],
  removeNodes: RemoveNodes,
  removeEdges: RemoveEdges,
  findNode: FindNode
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
    const node = findNode(getSelectedNodes[0].id)
    if (node && Array.isArray(state.objectId) && Array.isArray(state.oldState)) {
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
  const node = findNode(getSelectedNodes[0].id)
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
