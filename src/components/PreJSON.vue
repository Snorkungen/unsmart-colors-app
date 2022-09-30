<script setup lang="ts">

defineProps<{
    json: string
}>();

</script>
<template>
    <pre v-for="line in json.split('\n')">{{line}}</pre>
</template>    