<template>
  <label for="upload" class="upload-button">
    <v-icon color="grey-darken-3" size="small">mdi-upload</v-icon>
    <input type="file" id="upload" style="display: none" />
  </label>
</template>

<style scoped>
.upload-button {
  cursor: pointer;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
  padding: 4px;
  width: fit-content;
  text-align: center;
  position: absolute;
  top: 15px;
  left: 97%;
  top: 15px;
}
.upload-button:hover {
  background-color: #eeeeee;
}
</style>
