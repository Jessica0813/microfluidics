import { type StateController, ActionType } from '@/types/stateController'
import type { Node } from '@vue-flow/core'

export function createState(node: Node, type: ActionType) {
  let name: string = ''
  switch (type) {
    case ActionType.CREATE_NODE:
      name = 'create node ' + node.id
      break
    case ActionType.DELETE_NODE:
      name = 'delete node ' + node.id
      break
    case ActionType.NODE_POSITION_CHANGE:
      name = 'move node ' + node.id
      break
    case ActionType.NODE_DATA_CHANGE:
      name = 'change data of the node ' + node.id
      break
  }
  const state: StateController = {
    type: type,
    name: name,
    objectId: node.id,
    objectPosition: node.position,
    data: node.data
  }

  return state
}
