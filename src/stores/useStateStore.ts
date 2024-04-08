import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StateController } from '@/types/stateController.ts'

export const useStateStore = defineStore('state', () => {
  const redo = ref<StateController[]>([])
  const undo = ref<StateController[]>([])

  function addState(stateController: StateController) {
    if (redo.value.length > 0) {
      redo.value = []
    }
    undo.value.push(stateController)
    console.log(undo.value)
  }

  function undoState(): StateController | null {
    const lastState = undo.value.pop()
    if (lastState) {
      redo.value.push(lastState)
      return lastState
    }
    return null
  }

  function redoState() {
    const lastState = redo.value.pop()
    if (lastState) {
      undo.value.push(lastState)
    }
  }

  return {
    redo,
    undo,
    addState,
    undoState,
    redoState
  }
})
