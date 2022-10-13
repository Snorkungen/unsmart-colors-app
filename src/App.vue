<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import { ColorEntries, colors } from "./lib/colors";
import Theme from "./lib/theme";
import Navbar from "./components/Navbar.vue";
import ColorSquare from "./components/ColorSquare.vue";
import { hexToRGB } from "./lib/color";
import useHash from "./lib/hash";


interface HashData {
  primary: string;
}

const Hash = useHash<HashData>({
  serialize(data) {
    return data.primary;
  },
  deSerialize(hex) {
    if (!hex) throw new Error("Primary Missing")
    return {
      primary: "#" + hex
    }
  }
});

const setPrimary = (primary: string) => {
  Hash.update({
    primary
  });
}

Hash.listen((data) => {
  if (!data) return;
  theme.value = new Theme(hexToRGB(data.primary));
});

const theme = ref(new Theme(hexToRGB(Hash.data?.primary || "#5838c8")));


</script>

<template>
  <div id="page-wrapper">
    <Navbar :theme="theme" :set-primary="setPrimary" />
    <main>
      <h2>What?</h2>
      <p>This page is an attempt at dynamically generating a color scheme for a web page.</p>

      <h2>How?</h2>
      <p>To generate a new color scheme press the button with the content "Generate!", the button can be found in the
        top right of the page. If you press the square to the left of the generate button you can select an input color.
      </p>

      <h2>How does this work?</h2>
      <p>The color scheme is generated using an input color. Upon the input color other colors are created. The colors
        are chosen based upon the contrast ratio between the colors.</p>
      <h2>The colors.</h2>

      <!-- CSS Variables -->
      <div class="code">
        <template v-for="(color, name) in Theme.stripThemeToHexValues(theme)">
          <template v-if="typeof color == 'object'">
            <span v-for="(hex,key) in color">
              <span>--{{ name }}-{{ key }}:</span>
              <ColorSquare :color="hex" /> <span class="ck">{{ hex }}</span>;<br />
            </span>
          </template>
          <template v-else>
            <span>
              <span>--{{ name }}:</span>
              <ColorSquare :color="color" /> <span class="ck">{{ color }}</span>;<br />
            </span>
          </template>
        </template>
      </div>

      <!-- JSON -->
      <div class="code">
        <span>{<br /></span>
        <span v-for="(color, name,index) in Theme.stripThemeToHexValues(theme)">
          <span>&nbsp;&nbsp;</span>
          <span>"{{name}}":</span>
          <template v-if="typeof color == 'object'">
            <span>{ <br /></span>
            <span v-for="(value,key,jindex) in color">
              <span>&nbsp;&nbsp;</span>
              <span>&nbsp;&nbsp;</span>
              <span>{{key}}</span>:
              <ColorSquare :color="value" /> <span class="ck">"{{value}}"</span>
              <span v-if="jindex < Object.keys(color).length - 1">,</span>
              <br />
            </span>
            <span>&nbsp;&nbsp;</span>
            <span>}</span>
          </template>
          <template v-else>
            <ColorSquare :color="color" />
            <span class="ck"> "{{color}}"</span>
          </template>
          <span v-if="index < Object.keys(Theme.stripThemeToHexValues(theme)).length - 1">,</span>
          <br />
        </span>
        <span>}</span>
      </div>

    </main>
    <footer>
      <p>UnSmart Colors App</p>
      <p>
        <a href="https://ochuko.me">Jonne Oke</a>
        2022
      </p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
:root #page-wrapper {
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

  --danger: v-bind(theme.danger.hex);
  --success: v-bind(theme.success.hex);
  --warning: v-bind(theme.warning.hex);
  --info: v-bind(theme.info.hex);
}

#page-wrapper {
  height: 100%;
  width: 100%;

  background-color: var(--background);
  // background-image: linear-gradient(-45deg,var(--background) 85%, var(--background-1), var(--background-2), var(--background-3));
  color: var(--foreground);

  overflow: auto;
  display: flex;
  flex-direction: column;

  &,
  >* {
    transition: all 10ms linear;
  }

  main {
    flex-grow: 2;
    max-width: 66ch;
    width: 100%;
    display: block;
    margin: 0 auto;
    text-align: center;

    padding: 1em;

    >p {
      text-align: left;
      margin: 1em 0;
    }
  }
}

.code {
  font-family: monospace;
  background-color: var(--foreground);
  color: var(--secondary);
  filter: drop-shadow(0 0 15px var(--background-3));
  font-weight: 600;
  font-size: 1.5em;
  margin: 1em auto;
  padding: 2em;
  border-radius: 3px;
  text-align: left;
  width: 100%;

  .ck {
    color: var(--primary);
  }
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

.message {
  display: block;
  width: 100%;

  margin: 0 0 1em;
  padding: 6px;

  background-color: var(--foreground);
  color: var(--background);

  font-weight: 600;

  $message-variants: ("danger",
    "success",
    "warning",
    "info"
  );

  @each $variant,
  $_ in $message-variants {
    &.#{$variant} {
      background-color: var(--#{$variant});
      color: var(--foreground);
    }
  }
}
</style>
