<script lang="ts" setup>
import Theme from '../lib/theme';
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import ColorSquare from './ColorSquare.vue';

const { theme } = defineProps<{
    theme: Theme
}>();

console.log(theme)

</script>

<template>
    <Card>
        <CardHeader>Theme Preview</CardHeader>
        <div class="flex mr-first">
            <ColorSquare :color="theme.primary.rgb" />
            <div v-for="{ rgb } in theme.primary.variants">
                <ColorSquare :color="rgb" />
            </div>
        </div>
        <div class="flex mr-first">
            <ColorSquare :color="theme.secondary.rgb" />
            <div v-for="{ rgb } in theme.secondary.variants">
                <ColorSquare :color="rgb" />
            </div>
        </div>
        <div class="flex mr-first">
            <ColorSquare :color="theme.foreground.rgb" />
            <div v-for="{ rgb } in theme.foreground.variants">
                <ColorSquare :color="rgb" />
            </div>
        </div>
        <div class="flex mr-first">
            <ColorSquare :color="theme.background.rgb" />
            <div v-for="{ rgb } in theme.background.variants">
                <ColorSquare :color="rgb" />
            </div>
        </div>
        <div class="flex center">
            <ColorSquare :color="theme.warning.rgb" />
            <ColorSquare :color="theme.danger.rgb" />
            <ColorSquare :color="theme.info.rgb" />
            <ColorSquare :color="theme.success.rgb" />
        </div>
    </Card>
</template>

<style scoped>
.flex {
    display: flex;
}
.flex.mr-first > *:first-of-type {
    margin-right: 2em;
}

.flex.center {
    justify-content: center;
    align-items: center;
}
</style>