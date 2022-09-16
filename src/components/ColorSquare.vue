<script lang="ts" setup>
import { RGBColor, RGBToHex } from '../lib/color';


defineProps<{
    color: RGBColor
}>()

const click = (c: any) => {
    console.log(
        c.slice(0, 3).join(" "), RGBToHex(c)
    )
}

</script>

<template>
    <div class="square" @click="() => click(color)"></div>
</template>

<style lang="scss" scoped>
.square {
    display: inline-block;
    margin: 0 4px;
    $size: 1em;
    width: $size;
    height: $size;
    border-radius: 3px;
    background-color: v-bind("RGBToHex(color,true)");
}
</style>