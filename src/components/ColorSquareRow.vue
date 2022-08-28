<script lang="ts" setup>
import { RGBColor } from '../lib/color';
import ColorSquare from './ColorSquare.vue';

defineProps<{
    colors: Array<RGBColor>
}>()
</script>

<template>
    <div class="flex">
        <div v-for="color in colors">
            <ColorSquare :color="color" />
        </div>
    </div>
</template>

<style scoped>
    div.flex {
        gap: 2px;
    }
</style>