import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StateController } from '@/types/stateController.ts'

export const useStateStore = defineStore('state', () => {
  const redoList = ref<StateController[]>([])
  const undoList = ref<StateController[]>([])

  function addState(stateController: StateController) {
    if (redoList.value.length > 0) {
      redoList.value = []
    }
    undoList.value.push(stateController)
    console.log(undoList.value)
  }

  function undoState(): StateController | null {
    const lastState = undoList.value.pop()
    if (lastState) {
      redoList.value.push(lastState)
      return lastState
    }
    return null
  }

  function redoState(): StateController | null {
    const lastState = redoList.value.pop()
    if (lastState) {
      undoList.value.push(lastState)
      return lastState
    }
    return null
  }

  function isUndoable() {
    return undoList.value.length > 0
  }

  function isRedoable() {
    return redoList.value.length > 0
  }

  return {
    redoList,
    undoList,
    addState,
    undoState,
    redoState,
    isUndoable,
    isRedoable
  }
})
