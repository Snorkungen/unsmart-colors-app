<template>
    <div class="card">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
    .card {
        // max-width: 460px;
        background: var(--color3);
        color: var(--color2);

        padding: 1em;
        border-radius: 5px;
    }

</style>