<script setup lang="ts">
import { Color, ColorWithVariants } from '../lib/theme';
import ColorSquare from './ColorSquare.vue';

defineProps<{
    name: string;
    c: Color;
}>();
</script>


<template>
    <pre>--{{name}}:<ColorSquare :color="c.rgb" /> {{c.hex}};</pre>
</template>

<style>
.square {
    border: solid 2px var(--primary-1);
}
</style>