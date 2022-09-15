<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import { colors } from "./lib/colors";
import Theme from "./lib/theme";

import ThemePreview from "./components/ThemePreview.vue";
import Button from "./components/Button.vue";
import Card from "./components/Card.vue";
import ColorSquare from "./components/ColorSquare.vue";
import Navbar from "./components/Navbar.vue";

const setTheme = (value: Theme) => {
  theme.value = value
}
const theme = ref(new Theme(colors[Math.floor(Math.random() * 800)][0]))

</script>

<template>
  <div id="page-wrapper">
    <Navbar :set-theme="setTheme" />
    <main>
      <h2>Hello World</h2>
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis, numquam voluptate deserunt dicta reprehenderit assumenda voluptates quibusdam, voluptatum obcaecati dolore ad porro inventore deleniti magnam distinctio fugiat a pariatur minus?</p>
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis, numquam voluptate deserunt dicta reprehenderit assumenda voluptates quibusdam, voluptatum obcaecati dolore ad porro inventore deleniti magnam distinctio fugiat a pariatur minus?</p>
    </main>
  </div>
</template>

<style scoped lang="scss">
#page-wrapper {
  --primary: v-bind(theme.primary.hex);
  --primary-1: v-bind(theme.primary.variants[0].hex);
  --primary-2: v-bind(theme.primary.variants[1].hex);
  --primary-3: v-bind(theme.primary.variants[2].hex);
  --secondary: v-bind(theme.secondary.hex);
  --secondary-1: v-bind(theme.secondary.variants[0].hex);
  --secondary-2: v-bind(theme.secondary.variants[1].hex);
  --secondary-3: v-bind(theme.secondary.variants[2].hex);
  --foreground: v-bind(theme.foreground.hex);
  --foreground-1: v-bind(theme.foreground.variants[0].hex);
  --foreground-2: v-bind(theme.foreground.variants[1].hex);
  --foreground-3: v-bind(theme.foreground.variants[2].hex);
  --background: v-bind(theme.background.hex);
  --background-1: v-bind(theme.background.variants[0].hex);
  --background-2: v-bind(theme.background.variants[1].hex);
  --background-3: v-bind(theme.background.variants[2].hex);


  height: 100%;
  width: 100%;

  background: var(--background);
  color: var(--foreground);

  main {
    max-width: 66ch;
    display: block;
    margin: 0 auto;
    text-align: center;

    padding: 1em;

    > p {
      text-align: left;
      margin: 1em;
    }
  }
}


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