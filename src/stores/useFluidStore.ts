import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fluid } from '@/types/fluid.ts'

export const useFluidStore = defineStore('fluid', () => {
  const fluids = ref<Fluid[]>([
    {
      id: 'fluid-0',
      name: 'Air',
      color: '#00000000',
      viscosity: 0.018,
      withParticle: 'No'
    }
  ])

  let fluidIndex = 1

  const fluidNames = computed(() => fluids.value.map((fluid) => fluid.name))

  function generateFluidId() {
    return `fluid-${fluidIndex++}`
  }

  function addFluid(fluid: Fluid) {
    fluids.value.push(fluid)
  }

  function removeFluid(id: string) {
    const index = fluids.value.findIndex((fluid) => fluid.id === id)
    fluids.value.splice(index, 1)
  }

  function editFluid(id: string, updatedFluid: Partial<Fluid>) {
    const index = fluids.value.findIndex((fluid) => fluid.id === id)
    if (index >= 0 && index < fluids.value.length) {
      Object.assign(fluids.value[index], updatedFluid)
    }
  }

  function isNameExist(name: string | undefined, id: string | undefined) {
    return fluids.value.some((fluid) => fluid.name === name && fluid.id !== id)
  }

  function getFluidById(id: string) {
    return fluids.value.find((fluid) => fluid.id === id)
  }

  function getFluidIndex() {
    return fluidIndex
  }

  function initFluidIndex(index: number) {
    fluidIndex = index
  }

  function resetFluids() {
    fluids.value = []
  }
  return {
    fluids,
    fluidNames,
    generateFluidId,
    addFluid,
    removeFluid,
    editFluid,
    isNameExist,
    getFluidById,
    getFluidIndex,
    initFluidIndex,
    resetFluids
  }
})
