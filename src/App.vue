<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";

import ThemePreview from "./components/ThemePreview.vue";
import Theme from "./lib/theme";
import Theme2 from "./lib/theme";
import Button from "./components/Button.vue";
import { ruinColor, createRandomColor } from "./lib/color";

let color = createRandomColor();
let onClick = () => {
  color = createRandomColor();
  theme.value = new Theme2(color);
}

const theme = ref(new Theme2([...color]))

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

  background: var(--background);
  color: var(--foreground);

  &.center-content {
    display: grid;
    place-items: center;
  }
}
</style>