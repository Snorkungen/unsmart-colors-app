<template>
    <div class="card">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
    .card {
        // max-width: 460px;
        background: var(--foreground);
        color: var(--text);

        padding: 1em;
        border-radius: 5px;
    }

</style>