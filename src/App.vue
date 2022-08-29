<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";

import ThemePreview from "./components/ThemePreview.vue";
import Theme from "./lib/theme";
import Button from "./components/Button.vue";

let onClick = () => {
  theme.value = new Theme([239, 126, 23]);
}


const theme = ref(new Theme([0, 0, 0]))

</script>

<template>
  <div class="page-container center-content">
    <Button @click="onClick">hello</Button>
    <ThemePreview :theme="theme" />
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