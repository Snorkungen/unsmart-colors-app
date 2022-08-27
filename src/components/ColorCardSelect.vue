<script setup lang="ts">
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import { ref } from 'vue';
import { hexToRGB, RGBColor, generateVariants } from "../lib/color";
import ColorSquare from './ColorSquare.vue';

let rgb: RGBColor = [50,10,200, 1];
let colors = ref<RGBColor[]>(generateVariants(rgb, 26));

const handleInput: HTMLInputElement["oninput"] = (event) => {
    if (!event.target || !(event.target instanceof HTMLInputElement)) return;
    let { value } = event.target;

    let rgb = hexToRGB(value);

    colors.value = generateVariants(rgb, 20)
}

</script>


<template>
    <Card>
        <CardHeader>
            Select Color
        </CardHeader>
        <input type="color" @input="handleInput">
        <div class="flex">
            <div v-for="color in colors">
                <ColorSquare :color="color" />
            </div>
        </div>
    </Card>
</template>

<style scoped>
    .flex {
        display: flex;
    }

</style>