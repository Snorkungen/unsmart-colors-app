<script setup lang="ts">
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import { ref } from 'vue';
import { hexToRGB, RGBColor, generateVariants, RGBToHSL, HSLToRGB, rotateHue } from "../lib/color";
import ColorSquareRow from './ColorSquareRow.vue';

let rgb: RGBColor = [50, 10, 200, 1];
let colorsMatrix = ref<Array<Array<RGBColor>>>([generateVariants(rgb, 26), generateVariants(rgb, 10)])

const handleInput: HTMLInputElement["oninput"] = (event) => {
    if (!event.target || !(event.target instanceof HTMLInputElement)) return;
    let { value } = event.target;

    let rgb = hexToRGB(value);

    let hsl = RGBToHSL(rgb)
    colorsMatrix.value = [
        generateVariants(rgb, 20),
        generateVariants(HSLToRGB(rotateHue(hsl, 60)), 35),
        generateVariants(HSLToRGB(rotateHue(hsl, 60 * 3)), 35),
        generateVariants(HSLToRGB(rotateHue(hsl, -60)), 35),
    ]


}

</script>


<template>
    <Card>
        <CardHeader>
            Select Color
        </CardHeader>
        <input type="color" @input="handleInput">
        <div v-for="colors in colorsMatrix">
            <ColorSquareRow :colors="colors" />
        </div>
    </Card>
</template>

<style scoped>
.flex {
    display: flex;
}
</style>