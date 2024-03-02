import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Fluid } from '@/types/fluid.ts'

export const useFluidStore = defineStore('fluid', () => {
  const fluidTypes = ref<Fluid[]>([
    {
      name: 'Water',
      color: '#0000ff',
      viscosity: 1,
      withParticle: 'No'
    },
    {
      name: 'Oil',
      color: '#ff0000',
      viscosity: 0.5,
      withParticle: 'Yes',
      particleSize: 5,
      particleDensity: 0.5
    }
  ])

  function addFluid(fluid: Fluid) {
    fluidTypes.value.unshift(fluid)
  }

  function removeFluid(index: number) {
    if (index >= 0 && index < fluidTypes.value.length) {
      fluidTypes.value.splice(index, 1)
    }
  }

  function editFluid(index: number, updatedFluid: Partial<Fluid>) {
    if (index >= 0 && index < fluidTypes.value.length) {
      Object.assign(fluidTypes.value[index], updatedFluid)
    }
  }

  return { fluidTypes, addFluid, removeFluid, editFluid }
})
