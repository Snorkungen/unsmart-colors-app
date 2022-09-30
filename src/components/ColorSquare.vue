<script lang="ts" setup>
defineProps<{
    color: string
}>()

</script>

<template>
    <span class="square"></span>
</template>

<style lang="scss" scoped>
.square {
    display: inline-block;
    margin: 0 4px;
    $size: 1em;
    width: $size;
    height: $size;
    border-radius: 3px;
    background-color: v-bind(color);
}
</style>