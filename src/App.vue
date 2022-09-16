<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import { colors } from "./lib/colors";
import Theme from "./lib/theme";

import ThemePreview from "./components/ThemePreview.vue";
import Navbar from "./components/Navbar.vue";
import ColorSquare from "./components/ColorSquare.vue";
import { hexToRGB } from "./lib/color";

const setTheme = (value: Theme) => {
  window.location.hash = value.primary.hex
  theme.value = value
}

let startColor = colors[Math.floor(Math.random() * 800)][0]
if (location.hash) {
  startColor = hexToRGB(location.hash)
}

const theme = ref(new Theme(startColor));

</script>

<template>
  <div id="page-wrapper">
    <Navbar :theme="theme" :set-theme="setTheme" />
    <main>
      <h2>What?</h2>
      <p>This page is an attempt to dynamically generating a color scheme for a web page.</p>
      <h2>How?</h2>
      <p>To generate a new color scheme press the button with the content "Generate!", the button can be found in the
        top right of the page. If you press the square to the left of the generate button you can select an input color.
      </p>
      <h2>How does this it work?</h2>
      <p>The color scheme is generated using an input color upon the other colors are created from. The colors are
        chosen
        based upon the contrast ration between the colors.</p>
      <h2>The colors.</h2>
      <div class="code">
        <p>--primary:
          <ColorSquare :color="theme.primary.rgb" />{{theme.primary.hex}};
        </p>
        <p>--primary-1:
          <ColorSquare :color="theme.primary.variants[0].rgb" />{{theme.primary.variants[0].hex}};
        </p>
        <p>--primary-2:
          <ColorSquare :color="theme.primary.variants[1].rgb" />{{theme.primary.variants[1].hex}};
        </p>
        <p>--primary-3:
          <ColorSquare :color="theme.primary.variants[2].rgb" />{{theme.primary.variants[2].hex}};
        </p>
        <p>--secondary:
          <ColorSquare :color="theme.secondary.rgb" />{{theme.secondary.hex}}
        </p>
        <p>--secondary-1:
          <ColorSquare :color="theme.secondary.variants[0].rgb" />{{theme.secondary.variants[0].hex}};
        </p>
        <p>--secondary-2:
          <ColorSquare :color="theme.secondary.variants[1].rgb" />{{theme.secondary.variants[1].hex}};
        </p>
        <p>--secondary-3:
          <ColorSquare :color="theme.secondary.variants[2].rgb" />{{theme.secondary.variants[2].hex}};
        </p>
        <p>--foreground:
          <ColorSquare :color="theme.foreground.rgb" />{{theme.foreground.hex}};
        </p>
        <p>--foreground-1:
          <ColorSquare :color="theme.foreground.variants[0].rgb" />{{theme.foreground.variants[0].hex}};
        </p>
        <p>--foreground-2:
          <ColorSquare :color="theme.foreground.variants[1].rgb" />{{theme.foreground.variants[1].hex}};
        </p>
        <p>--foreground-3:
          <ColorSquare :color="theme.foreground.variants[2].rgb" />{{theme.foreground.variants[2].hex}};
        </p>
        <p>--background:
          <ColorSquare :color="theme.background.rgb" />{{theme.background.hex}};
        </p>
        <p>--background-1:
          <ColorSquare :color="theme.background.variants[0].rgb" />{{theme.background.variants[0].hex}};
        </p>
        <p>--background-2:
          <ColorSquare :color="theme.background.variants[1].rgb" />{{theme.background.variants[1].hex}};
        </p>
        <p>--background-3:
          <ColorSquare :color="theme.background.variants[2].rgb" />{{theme.background.variants[2].hex}};
        </p>
      </div>
    </main>
    <footer>
      <p>Unsmart Colors App</p>
      <p>
        <a href="https://ochuko.me">Jonne Oke</a>
        2022
      </p>
    </footer>
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

  background-color: var(--background);
  background-image: linear-gradient(var(--background-3), var(--background-2), var(--background-1), var(--background));
  color: var(--foreground);

  overflow: auto;

  main {
    max-width: 66ch;
    display: block;
    margin: 0 auto;
    text-align: center;

    padding: 1em;

    >p {
      text-align: left;
      margin: 1em;
    }
  }
}

.code {
  background-color: var(--foreground-3);
  background-image: linear-gradient(-45deg, var(--foreground), var(--foreground-1), var(--foreground-2), var(--foreground-3));
  color: var(--primary);
  filter: drop-shadow(0 0 5px var(--foreground-3));
  // color: var(--primary);
  margin: 2em;
  padding: 1em;
  border-radius: 5px;
  text-align: left;
}

footer {
  position: sticky;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 1em;
  display: flex;
  justify-content: space-between;

  background-color: var(--primary);
  color: var(--foreground);
  font-weight: bold;
  font-size: large;
}

a {
  color: inherit;
}
</style>