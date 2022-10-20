<script setup lang="ts">
import { RGBToHex } from '../lib/color';
import { colors } from '../lib/colors';
import Theme from '../lib/theme';
import Button from './Button.vue';
import ColorPicker from './ColorPicker.vue';

let { setPrimary, theme } = defineProps<{
    setPrimary: (primary: string) => void
    theme: Theme
}>();


const generate = () => {
    let entry = colors[Math.floor(Math.random() * colors.length)];
    setPrimary(RGBToHex(entry.rgb))
}

const handleColorInput: HTMLInputElement["oninput"] = (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    setPrimary(event.target.value);
}

</script>

<template>
    <nav>
        <div>
            <h1>UnSmart Colors App</h1>
        </div>
        <div>
            <ColorPicker :value="theme.primary.hex"  :input="(hex) => setPrimary(hex)" /> 
            <!-- <input @input="handleColorInput" type="color" :value="theme.primary.hex" /> -->
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

    > div {
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