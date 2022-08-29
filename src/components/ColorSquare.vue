<script lang="ts" setup>
import { RGBColor, RGBToHex } from '../lib/color';


defineProps<{
    color: RGBColor
}>()

const click = (c: any) => { console.log(c.join(" ")) }

</script>

<template>
    <div class="square" @click="() => click(color)"></div>
</template>

<style lang="scss" scoped>
.square {
    $size: 40px;
    width: $size;
    height: $size;
    // border-radius: 3px;
    background-color: v-bind("RGBToHex(color,true)");
}
</style>