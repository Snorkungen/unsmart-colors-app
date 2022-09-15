<script setup lang="ts">
import { colors } from '../lib/colors';
import Theme from '../lib/theme';
import Button from './Button.vue';


let { setTheme } = defineProps<{
    setTheme: (theme: Theme) => void
}>();



const generate = () => {
    setTheme(new Theme(
        colors[Math.floor(Math.random() * colors.length)][0]
    ))
}

</script>

<template>
    <nav>
        <h1>UnSmart Colors App</h1>
        <Button @click="generate" variant="secondary">Generate!</Button>
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;

    background-color: var(--primary);
    color: var(--foreground);
}
</style>