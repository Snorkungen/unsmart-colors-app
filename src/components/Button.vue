<script lang="ts" setup>
import classnames from "../lib/classnames"

defineProps<{
    variant ?: "primary" | "secondary"
}>()


</script>

<template>
    <button :class='classnames("button", variant)'>
        <slot></slot>
    </button>
</template>

<style scoped lang="scss">
.button {
    border: none;
    font-size: 1.1em;
    margin: 6px;
    border-radius: 3px;
    padding: 0.5rem;
    background: var(--background);
    color: var(--foreground);
    font-weight: 600;
    border-width: 3px;
    border-style: solid;
    border-color: transparent;
    cursor: pointer;
    transition: all 240ms ease-in-out;

    &:hover {
        background: var(--background-1);
        border-color: var(--background-2);
    }

    &.primary {
        background: var(--primary);
        color: var(--foreground);
        border-color: transparent;

        &:hover {
            background: var(--primary-1);
            border-color: var(--primary-2);
        }
    }

    &.secondary {
        background: var(--secondary);
        color: var(--foreground);
        border-color: transparent;

        &:hover {
            background: var(--secondary-1);
            border-color: var(--secondary-2);
        }
    }

}
</style>