import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fluid } from '@/types/fluid.ts'

export const useFluidStore = defineStore('fluid', () => {
  const fluids = ref<Fluid[]>([
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

  const fluidNames = computed(() => fluids.value.map((fluid) => fluid.name))

  function addFluid(fluid: Fluid) {
    fluids.value.unshift(fluid)
  }

  function removeFluid(index: number) {
    if (index >= 0 && index < fluids.value.length) {
      fluids.value.splice(index, 1)
    }
  }

  function editFluid(index: number, updatedFluid: Partial<Fluid>) {
    if (index >= 0 && index < fluids.value.length) {
      Object.assign(fluids.value[index], updatedFluid)
    }
  }

  return { fluids, fluidNames, addFluid, removeFluid, editFluid }
})
