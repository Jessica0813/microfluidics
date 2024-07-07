<template>
  <v-dialog v-model="isTableVisible" width="80%" min-height="80%" max-height="80%" scrollable>
    <v-card class="pa-10">
      <DeleteConfirmationDialog
        v-model="dialogDelete"
        @close="closeDeleteDialog"
        @cancel="cancelItemDelete"
        @confirm="confirmItemDelete"
      />
      <ItemCreateEditDialog
        v-model:isDialogVisible="dialogCreateOrEdit"
        v-model:nameInput="name"
        v-model:colorInput="color"
        v-model:viscosityInput="viscosity"
        v-model:withParticle="withParticle"
        v-model:particleSize="particleSize"
        v-model:particleDensity="particleDensity"
        @close="closeCreateOrEditDialog"
        @cancel="cancelItemCreateOrEdit"
        @save="confirmItemCreateOrEdit"
        :itemId="createOrEditItemId"
      />
      <v-card-title class="d-flex align-center pe-2">
        Fluids
        <v-spacer></v-spacer>
        <CustomizedButton buttonName="Add new item" @onClick="handleAddNewFluid" />
      </v-card-title>

      <v-divider></v-divider>
      <v-data-table-virtual :headers="headers" :items="fluids" density="comfortable" :hover="true">
        <template v-slot:headers="{ columns }">
          <tr class="bg-grey-lighten-3">
            <template v-for="column in columns" :key="column.key">
              <td class="">
                <p class="font-weight-bold">{{ column.title }}</p>
              </td>
            </template>
          </tr>
        </template>
        <template v-slot:item.color="{ item }">
          <div
            :style="{
              width: '30px',
              height: '15px',
              borderRadius: '2px',
              backgroundColor: item.color
            }"
          ></div>
        </template>
        <template v-slot:item.withParticle="{ item }">
          <div>{{ item.withParticle === 'Yes' ? 'Yes' : 'No' }}</div>
        </template>
        <template v-slot:item.particleSize="{ item }">
          <div>{{ item.withParticle === 'Yes' ? item.particleSize : '-' }}</div>
        </template>
        <template v-slot:item.particleDensity="{ item }">
          <div>{{ item.withParticle === 'Yes' ? item.particleDensity : '-' }}</div>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="me-2" color="grey-darken-3" @click="handleEditFluid(item)">
            mdi-pencil-outline
          </v-icon>
          <v-icon size="small" color="grey-darken-3" @click="deleteItem(item.id)">
            mdi-delete-outline
          </v-icon>
        </template>
      </v-data-table-virtual>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { type Fluid } from '@/types/fluid'
import { useFluidStore } from '@/stores/useFluidStore'
import CustomizedButton from './CustomizedButton.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import ItemCreateEditDialog from './ItemCreateEditDialog.vue'

const isTableVisible = defineModel<boolean>('isTableVisible')

const dialogDelete = ref(false)
const deleteItemId = ref('')

const dialogCreateOrEdit = ref(false)
const createOrEditItemId = ref('')
const name = ref('')
const color = ref('')
const viscosity = ref(0)
const withParticle = ref<'Yes' | 'No'>('No')
const particleSize = ref(0)
const particleDensity = ref(0)

const headers: any = [
  { title: 'Name', align: 'start', sortable: false, key: 'name', width: '20%' },
  { title: 'Color', align: 'start', sortable: false, key: 'color', width: '10%' },
  { title: 'Viscosity(cP)', align: 'start', sortable: false, key: 'viscosity', width: '10%' },
  { title: 'WithParticle', align: 'start', sortable: false, key: 'withParticle', width: '10%' },
  {
    title: 'Particle Size(nm)',
    align: 'start',
    sortable: false,
    key: 'particleSize',
    width: '15%'
  },
  {
    title: 'Particle Density(g/ml)',
    align: 'start',
    sortable: false,
    key: 'particleDensity',
    width: '20%'
  },
  { title: 'Actions', align: 'start', sortable: false, key: 'actions', width: '15%' }
]

const { generateFluidId, addFluid, removeFluid, editFluid } = useFluidStore()
const { fluids } = storeToRefs(useFluidStore())

function deleteItem(id: string) {
  dialogDelete.value = true
  deleteItemId.value = id
}

function closeDeleteDialog() {
  dialogDelete.value = false
  deleteItemId.value = ''
}

function confirmItemDelete() {
  removeFluid(deleteItemId.value)
  closeDeleteDialog()
}

function cancelItemDelete() {
  closeDeleteDialog()
}

function closeCreateOrEditDialog() {
  dialogCreateOrEdit.value = false
  createOrEditItemId.value = ''
}

function cancelItemCreateOrEdit() {
  closeCreateOrEditDialog()
}

function confirmItemCreateOrEdit() {
  if (createOrEditItemId.value === '') {
    addFluid({
      id: generateFluidId(),
      name: name.value,
      color: color.value,
      viscosity: viscosity.value,
      withParticle: withParticle.value,
      particleDensity: particleDensity.value || undefined,
      particleSize: particleSize.value || undefined
    })
  } else {
    editFluid(createOrEditItemId.value, {
      name: name.value,
      color: color.value,
      viscosity: viscosity.value,
      withParticle: withParticle.value,
      particleDensity: particleDensity.value || undefined,
      particleSize: particleSize.value || undefined
    })
  }
  closeCreateOrEditDialog()
}

function handleAddNewFluid() {
  dialogCreateOrEdit.value = true
  name.value = ''
  color.value = '#000000'
  viscosity.value = 0
  withParticle.value = 'No'
  particleSize.value = 0
  particleDensity.value = 0
  createOrEditItemId.value = ''
}

function handleEditFluid(fluid: Fluid) {
  dialogCreateOrEdit.value = true
  name.value = fluid.name
  color.value = fluid.color
  viscosity.value = fluid.viscosity
  withParticle.value = fluid.withParticle
  if (fluid.withParticle === 'Yes' && fluid.particleSize && fluid.particleDensity) {
    particleSize.value = fluid.particleSize
    particleDensity.value = fluid.particleDensity
  }
  createOrEditItemId.value = fluid.id
}
</script>
