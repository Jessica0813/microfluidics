import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fluid } from '@/types/fluid.ts'

export const useFluidStore = defineStore('fluid', () => {
  const fluids = ref<Fluid[]>([
    {
      id: 'fluid-1',
      name: 'Water',
      color: '#0000ff',
      viscosity: 1,
      withParticle: 'No'
    },
    {
      id: 'fluid-2',
      name: 'Oil',
      color: '#ff0000',
      viscosity: 0.5,
      withParticle: 'Yes',
      particleSize: 5,
      particleDensity: 0.5
    }
  ])

  let fluidId = 3

  const fluidNames = computed(() => fluids.value.map((fluid) => fluid.name))

  function generateFluidId() {
    return `fluid-${fluidId++}`
  }

  function addFluid(fluid: Fluid) {
    fluids.value.unshift(fluid)
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

  return { fluids, fluidNames, generateFluidId, addFluid, removeFluid, editFluid, isNameExist }
})
