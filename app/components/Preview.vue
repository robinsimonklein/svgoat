<template>
  <div class="relative h-full w-full">
    <!-- SINGLE MODE -->
    <PreviewSingle v-if="store.mode === 'single'" />

    <!-- BATCH MODE -->
    <PreviewBatch v-else-if="store.mode === 'batch'" />

    <PreviewToolbar />
  </div>
</template>

<script setup lang="ts">
const store = useStore();
</script>
