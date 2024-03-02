<script setup lang="ts">
import { computed, defineModel } from 'vue'
import CustomizedButton from './CustomizedButton.vue'
import { useFluidStore } from '@/stores/useFluidStore'
import type { Fluid } from '@/types/fluid'
import CustomizedColorInputVue from '../general/CustomizedColorInput.vue'

const fluidStore = useFluidStore()

const props = defineProps({
  itemIndex: Number
})

const isDialogVisible = defineModel<boolean>('isDialogVisible')
const nameInput = defineModel<string>('nameInput')
const colorInput = defineModel<string>('colorInput', { default: '' })
const viscosityInput = defineModel('viscosityInput', { default: 0 })
const withParticle = defineModel<string>('withParticle', { default: 'No' })
const particleSize = defineModel('particleSize', { default: 0 })
const particleDensity = defineModel('particleDensity', { default: 0 })

const emit = defineEmits(['close', 'cancel', 'save'])

const isNameExisted = computed(() => {
  const enteredName = nameInput.value?.trim().toLowerCase()
  return fluidStore.fluidTypes.some(
    (fluid: Fluid, index: number) =>
      index !== props.itemIndex && fluid.name.toLowerCase() === enteredName
  )
})
</script>

<template>
  <v-dialog v-model="isDialogVisible" min-width="300" max-width="600" persistent>
    <v-card>
      <v-toolbar density="compact" flat height="52" :color="'transparent'">
        <v-spacer></v-spacer>
        <v-icon class="pr-4" size="20" color="grey-darken-1" @click="emit('close')">
          mdi-close
        </v-icon>
      </v-toolbar>
      <v-card-title class="text-center">Create New Fluid Type</v-card-title>
      <v-card-text>
        <v-container>
          <v-row class="align-start" dense>
            <v-col cols="3">
              <v-list-subheader>Name:</v-list-subheader>
            </v-col>
            <v-col cols="9">
              <v-text-field
                v-model="nameInput"
                placeholder="please enter the name of the fluid"
                variant="solo"
                density="compact"
                hide-details="auto"
                required
                :rules="[
                  () => !!nameInput || 'This field is required',
                  () => !isNameExisted || 'The name already exists'
                ]"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="align-center" dense>
            <v-col cols="3">
              <v-list-subheader>Color:</v-list-subheader>
            </v-col>
            <v-col cols="2">
              <CustomizedColorInputVue v-model:color="colorInput" />
            </v-col>
          </v-row>
          <v-row class="align-start" dense>
            <v-col cols="3">
              <v-list-subheader>Viscosity:</v-list-subheader>
            </v-col>
            <v-col cols="9">
              <v-text-field
                v-model="viscosityInput"
                type="number"
                placeholder="please enter the viscosity of the fluid"
                variant="solo"
                density="compact"
                hide-details="auto"
                suffix="cP"
                required
                :rules="[
                  () => viscosityInput === 0 || !!viscosityInput || 'Please enter a proper number'
                ]"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="align-start" dense>
            <v-col cols="3">
              <v-list-subheader>With Particle:</v-list-subheader>
            </v-col>
            <v-col cols="4">
              <v-radio-group inline v-model="withParticle" hide-details="auto">
                <v-radio label="Yes" value="Yes"></v-radio>
                <v-radio label="No" value="No"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-start" dense v-if="withParticle === 'Yes'">
            <v-col cols="3">
              <v-list-subheader>Particle Size:</v-list-subheader>
            </v-col>
            <v-col cols="9">
              <v-text-field
                v-model="particleSize"
                type="number"
                placeholder="please enter the size of the particle"
                variant="solo"
                density="compact"
                hide-details="auto"
                suffix="nm"
                required
                :rules="[
                  () => particleSize === 0 || !!particleSize || 'Please enter a proper number'
                ]"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="align-start" dense v-if="withParticle === 'Yes'">
            <v-col cols="3">
              <v-list-subheader>Particle Density:</v-list-subheader>
            </v-col>
            <v-col cols="9">
              <v-text-field
                v-model="particleDensity"
                type="number"
                placeholder="please enter the density of the particle"
                variant="solo"
                density="compact"
                hide-details="auto"
                suffix="g/ml"
                required
                :rules="[
                  () => particleDensity === 0 || !!particleDensity || 'Please enter a proper number'
                ]"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <CustomizedButton isCancelAction buttonName="Cancel" @onClick="emit('cancel')" />
        <CustomizedButton buttonName="Save" @onClick="emit('save')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
@/stores/usefluidStore
