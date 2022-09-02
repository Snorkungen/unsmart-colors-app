<template>
    <div class="header">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
    .card > .header {
        font-size: large;
        font-weight: 600;
        text-align: center;
        border-bottom: 3px solid var(--foreground-2);
        margin: 0.5em 0.2em 1em;
    }

</style>