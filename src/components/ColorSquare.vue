<script lang="ts" setup>
import { RGBColor, RGBToHex } from '../lib/color';


defineProps<{
    color: RGBColor
}>()
</script>

<template>
    <div class="square"></div>
</template>

<style lang="scss" scoped>
.square {
    $size: 40px;
    width: $size;
    height: $size;
    border-radius: 3px;
    background-color: v-bind("RGBToHex(color)");
}
</style>