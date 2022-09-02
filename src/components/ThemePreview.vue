<script lang="ts" setup>
import Theme from '../lib/theme';
import Card from './Card.vue';
import CardHeader from './CardHeader.vue';
import ColorSquare from './ColorSquare.vue';

const { theme } = defineProps<{
    theme: Theme
}>();
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
    <div class="flex">
        <Card class="webpage">
            <nav class="navbar">
                <h1>Navbar</h1>
            </nav>
            <div class="hero">
                <h1>Hello view this hero title.</h1>
                <p>A paragraph showing off the amazing contrast.</p>
                <div class="flex">
                    <button class="button">Default button</button>
                    <button class="button primary">Primary button</button>
                    <button class="button secondary">Secondary button</button>
                </div>
            </div>
            <div class="message warning">A warning message</div>
            <div class="message danger">A danger message</div>
            <div class="message info">An info message</div>
            <div class="message success">A success message</div>
        </Card>
    </div>
</template>

<style scoped lang="scss">
.flex {
    display: flex;
}

.flex.mr-first>*:first-of-type {
    margin-right: 2em;
}

.flex.center {
    justify-content: center;
    align-items: center;
}

.webpage {
    --primary: v-bind(theme.primary.hex);
    --primary-1: v-bind(theme.primary.variants[0].hex);
    --primary-2: v-bind(theme.primary.variants[1].hex);
    --secondary: v-bind(theme.secondary.hex);
    --secondary-1: v-bind(theme.secondary.variants[0].hex);
    --secondary-2: v-bind(theme.secondary.variants[1].hex);

    --foreground: v-bind(theme.foreground.hex);
    --foreground-1: v-bind(theme.foreground.variants[0].hex);
    --foreground-2: v-bind(theme.foreground.variants[1].hex);

    --background: v-bind(theme.background.hex);
    --background-1: v-bind(theme.background.variants[0].hex);
    --background-2: v-bind(theme.background.variants[1].hex);

    --info: v-bind(theme.info.hex);
    --danger: v-bind(theme.danger.hex);
    --warning: v-bind(theme.warning.hex);
    --success: v-bind(theme.success.hex);

    margin: 0 2rem;
    min-width: 500px;
    background: var(--background);
    color: var(--foreground);
    padding: 0;

    >* {
        padding: 0.4rem;
    }

    .navbar {

        width: 100%;
        background: var(--primary);
        color: var(--foreground);

        &.secondary {
            background: var(--secondary);
        }
    }

    .hero {
        background: var(--background-1);
        width: 80%;
        display: block;
        margin: 0 auto;
    }

    .button {
        border: none;
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

    .message {
        width: 100%;
        text-align: center;
        padding: 0.5em;
        background-color: var(--foreground);
        color: var(--foreground);
        font-size: 1.2em;
        font-weight: 700;

        &.warning {
            background-color: var(--warning);
        }

        &.danger {
            background-color: var(--danger);
        }

        &.success {
            background-color: var(--success);
        }

        &.info {
            background-color: var(--info);
        }
    }
}
</style>