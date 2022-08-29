<script setup lang="ts">
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import { ref } from 'vue';
import { hexToRGB, RGBColor, contrastingColor, generateVariants, createColorVariant, generateVariants_2, RGBToHSL, HSLToRGB, rotateHue } from "../lib/color";



const createRandomColor = (): RGBColor => {
    return HSLToRGB([Math.random(), Math.random(), Math.random()]);
}
let colorsMatrix = ref<Array<Array<RGBColor>>>([[createRandomColor()]])

const createColors = () => {
    let color_1 = createRandomColor(),
        color_2 = HSLToRGB(rotateHue(RGBToHSL(color_1), 180)),
        color_3 = HSLToRGB(rotateHue(RGBToHSL(color_1), 90)),
        color_4 = HSLToRGB(rotateHue(RGBToHSL(color_1), -90));
    let color_11 = contrastingColor(color_1),
        color_21 = contrastingColor(color_2),
        color_31 = contrastingColor(color_3),
        color_41 = contrastingColor(color_4);


        colorsMatrix.value = [
            [
                color_1, color_2, color_3, color_4
            ],
            [
                color_11,
                color_21,
                color_31,
                color_41,
            ],
        ]
}

const handleInput: HTMLInputElement["oninput"] = (event) => {
    if (!event.target || !(event.target instanceof HTMLInputElement)) return;
    let { value } = event.target;

    let rgb = hexToRGB(value);
    colorsMatrix.value = [
        [
            ...generateVariants_2(rgb, 1, 6).reverse(),
            rgb,
            ...generateVariants_2(rgb, -1, 6)
        ],
        [
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), 180)), 1, 6).reverse(),
            HSLToRGB(rotateHue(RGBToHSL(rgb), 180)),
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), 180)), -1, 6)
        ],
        [
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), 90)), 1, 6).reverse(),
            HSLToRGB(rotateHue(RGBToHSL(rgb), 90)),
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), 90)), -1, 6)
        ],
        [
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), -90)), 1, 6).reverse(),
            HSLToRGB(rotateHue(RGBToHSL(rgb), -90)),
            ...generateVariants_2(HSLToRGB(rotateHue(RGBToHSL(rgb), -90)), -1, 6)
        ],
    ]


}

</script>


<template>
    <Card>
        <CardHeader>
            Select Color
        </CardHeader>
        <button @click="createColors">Click Mes</button>
        <input type="color" @input="handleInput">
    </Card>
</template>

<style scoped>
.flex {
    display: flex;
}
</style>