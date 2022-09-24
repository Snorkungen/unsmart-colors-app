<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import { ColorEntries, colors } from "./lib/colors";
import Theme from "./lib/theme";
import Navbar from "./components/Navbar.vue";
import ColorSquare from "./components/ColorSquare.vue";
import { hexToRGB } from "./lib/color";

// fetch("./colors.sorted.json")
//   .then<ColorEntries>(res => res.status === 200 ? res.json() : [])
//   .then(entries => colors.push(...entries))
//   .finally(() => {
//     setTheme(new Theme(theme.value.primary.rgb))
//   })

const setTheme = (value: Theme) => {
  window.location.hash = value.primary.hex
  theme.value = value
}

let startColor = colors[Math.floor(Math.random() * 800)][0]
if (location.hash) {
  startColor = hexToRGB(location.hash)
}

const theme = ref(new Theme(startColor));

const dangerHexValues = ref(Theme.selectColorsUsingHue(340,10).map(([,hex]) => hex));
const warningHexValues = ref(Theme.selectColorsUsingHue(24,58).map(([,hex]) => hex));
const successHexValues = ref(Theme.selectColorsUsingHue(81,140).map(([,hex]) => hex));
const infoHexValues = ref(Theme.selectColorsUsingHue(175,200).map(([,hex]) => hex));

</script>

<template>
  <div id="page-wrapper">
    <Navbar :theme="theme" :set-theme="setTheme" />
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
          <ColorSquare :color="theme.secondary.rgb" />{{theme.secondary.hex}};
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
          <ColorSquare :color="theme.background.variants[2].rgb" /> {{theme.background.variants[2].hex}};
        </p>
      </div>
<!-- 
      <pre class="code">
        {{JSON.stringify(Theme.convertThemeIntoAMoreReadableObject(theme),null,1)}}
      </pre> -->

      <div class="messages">
        <div class="message danger">Danger Message</div>
        <div class="message success">Success Message</div>
        <div class="message warning">Warning Message</div>
        <div class="message info">Info Message</div>
      </div>

      <div v-for="hex in dangerHexValues" v-bind:style="{'background-color': hex}">{{hex}}</div>
      <div class="message" >Divider</div>
      <div v-for="hex in warningHexValues" v-bind:style="{'background-color': hex}">{{hex}}</div>
      <div class="message" >Divider</div>
      <div v-for="hex in successHexValues" v-bind:style="{'background-color': hex}">{{hex}}</div>
      <div class="message" >Divider</div>
      <div v-for="hex in infoHexValues" v-bind:style="{'background-color': hex}">{{hex}}</div>

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

  --danger: v-bind(theme.danger.hex);
  --success: v-bind(theme.success.hex);
  --warning: v-bind(theme.warning.hex);
  --info: v-bind(theme.info.hex);

  height: 100%;
  width: 100%;

  background-color: var(--background);
  background-image: linear-gradient(var(--background) 40%, var(--background-1), var(--background-2), var(--background-3));
  color: var(--foreground);

  overflow: auto;
  display: flex;
  flex-direction: column;

  main {
    flex-grow: 2;
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
  background-color: var(--foreground);
  color: var(--primary);
  filter: drop-shadow(0 0 15px var(--background-3));
  font-weight: 600;
  font-size: 1.1em;
  margin: 2em;
  padding: 1em;
  border-radius: 3px;
  text-align: left;

  .square {
    border: solid 2px var(--primary-1);
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
