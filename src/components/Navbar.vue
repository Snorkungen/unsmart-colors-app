<script setup lang="ts">
import { hexToRGB } from '../lib/color';
import { colors } from '../lib/colors';
import Theme from '../lib/theme';
import Button from './Button.vue';

let { setTheme, theme } = defineProps<{
    setTheme: (theme: Theme) => void
    theme: Theme
}>();


const generate = () => {
    let entry = colors[Math.floor(Math.random() * colors.length)];
    setTheme(new Theme(
        entry[0]
    ))
}

const handleColorInput: HTMLInputElement["oninput"] = (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    setTheme(new Theme(hexToRGB(event.target.value)))
}

</script>

<template>
    <nav>
        <h1>UnSmart Colors App</h1>
        <div>
            <input @input="handleColorInput" type="color" :value="theme.primary.hex" />
            <Button @click="generate" variant="secondary">Generate!</Button>
        </div>
    </nav>
</template>

<style scope lang="scss">
nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-around;

    background-color: var(--primary);
    color: var(--foreground);

    >div {
        display: grid;
        grid-template-columns: auto auto;
        place-items: center;
    }

    input[type="color"] {
        border: none;
        $size : 30px;
        width: $size;
        height: $size;

        &:hover {
            cursor: pointer;
        }
    }
}
</style>