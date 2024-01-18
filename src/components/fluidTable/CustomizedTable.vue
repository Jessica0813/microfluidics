<script setup lang="ts">
import { type Fluid } from '@/types/fluid'
import { useFluidStore } from '@/stores/fluid'
import { ref } from 'vue'
import CustomizedButton from './CustomizedButton.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import ItemFormDialog from './ItemFormDialog.vue'
import { defineModel } from 'vue'

const fluidStore = useFluidStore()

const isTableVisible = defineModel<boolean>('isTableVisible')

const headers: any = [
  { title: 'Name', align: 'start', sortable: false, key: 'name', width: '40%' },
  { title: 'Color', align: 'start', sortable: false, key: 'color', width: '20%' },
  { title: 'Viscosity(cP)', align: 'start', sortable: false, key: 'viscosity', width: '20%' },
  { title: 'Actions', align: 'start', sortable: false, key: 'actions', width: '20%' }
]

const dialogDelete = ref(false)
const deleteItemIndex = ref(-1)

const dialogCreateOrEdit = ref(false)
const createOrEditItemIndex = ref(-1)
const name = ref('')
const color = ref('')
const viscosity = ref(0)

function deleteItem(index: number) {
  dialogDelete.value = true
  deleteItemIndex.value = index
}

function closeDeleteDialog() {
  dialogDelete.value = false
  deleteItemIndex.value = -1
}

function confirmItemDelete() {
  fluidStore.removeFluid(deleteItemIndex.value)
  closeDeleteDialog()
}

function cancelItemDelete() {
  closeDeleteDialog()
}

function closeCreateOrEditDialog() {
  dialogCreateOrEdit.value = false
  createOrEditItemIndex.value = -1
}

function cancelItemCreateOrEdit() {
  closeCreateOrEditDialog()
}

function confirmItemCreateOrEdit() {
  if (createOrEditItemIndex.value === -1) {
    fluidStore.addFluid({
      name: name.value,
      color: color.value,
      viscosity: viscosity.value
    })
  } else {
    fluidStore.editFluid(createOrEditItemIndex.value, {
      name: name.value,
      color: color.value,
      viscosity: viscosity.value
    })
  }
  closeCreateOrEditDialog()
}

function handleAddNewFluid() {
  dialogCreateOrEdit.value = true
  name.value = ''
  color.value = ''
  viscosity.value = 0
  createOrEditItemIndex.value = -1
}

function handleEditFluid(index: number, fluid: Fluid) {
  dialogCreateOrEdit.value = true
  name.value = fluid.name
  color.value = fluid.color
  viscosity.value = fluid.viscosity
  createOrEditItemIndex.value = index
}
</script>

<template>
  <v-dialog v-model="isTableVisible" width="80%" min-height="80%" max-height="80%" scrollable>
    <v-card class="pa-10">
      <DeleteConfirmationDialog
        v-model="dialogDelete"
        @close="closeDeleteDialog"
        @cancel="cancelItemDelete"
        @confirm="confirmItemDelete"
      />
      <ItemFormDialog
        v-model:isDialogVisible="dialogCreateOrEdit"
        v-model:nameInput="name"
        v-model:colorInput="color"
        v-model:viscosityInput="viscosity"
        @close="closeCreateOrEditDialog"
        @cancel="cancelItemCreateOrEdit"
        @save="confirmItemCreateOrEdit"
        :itemIndex="createOrEditItemIndex"
      />
      <v-card-title class="d-flex align-center pe-2">
        Fluids
        <v-spacer></v-spacer>
        <CustomizedButton buttonName="Add new item" @onClick="handleAddNewFluid" />
      </v-card-title>

      <v-divider></v-divider>
      <v-data-table-virtual
        :headers="headers"
        :items="fluidStore.fluidTypes"
        density="comfortable"
        :hover="true"
      >
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
        <template v-slot:item.actions="{ item, index }">
          <v-icon
            size="small"
            class="me-2"
            color="grey-darken-3"
            @click="handleEditFluid(index, item)"
          >
            mdi-pencil-outline
          </v-icon>
          <v-icon size="small" color="grey-darken-3" @click="deleteItem(index)">
            mdi-delete-outline
          </v-icon>
        </template>
      </v-data-table-virtual>
    </v-card>
  </v-dialog>
</template>
