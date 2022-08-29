<script lang="ts" setup>
import { defineProps } from "vue";
// const { onClick } = defineProps<{
//     onClick: (event: any) => void
// }>();

</script>

<template>
    <button  class="button">
        <slot></slot>
    </button>
</template>

<style scoped>
.button {
    border: var(--color2) 2px solid;
}
</style>