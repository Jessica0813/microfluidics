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
