<template>
  <div class="menu">
    <label for="upload" class="button">
      <p>svg</p>
      <input type="file" id="upload" accept=".svg" style="display: none" />
    </label>
    <label for="upload" class="button">
      <p>zip</p>
      <input type="file" id="upload" accept=".zip" style="display: none" />
    </label>
  </div>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  font-size: 14px;
  min-width: 60px;
}
.button {
  text-align: center;
  padding: 4px 0px;
}
.button:hover {
  background-color: #e0e0e0;
}
</style>
