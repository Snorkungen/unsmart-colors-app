<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import ColorCardSelect from "./components/ColorCardSelect.vue";
</script>

<template>
  <div class="page-container center-content">
    <ColorCardSelect />
  </div>
</template>

<style scoped lang="scss">
.page-container {
  height: 100%;
  width: 100%;

  background: var(--color1);
  color: var(--color2);

  &.center-content {
    display: grid;
    place-items: center;
  }
}
</style>