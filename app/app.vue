<template>
  <UApp :toaster="toaster">
    <NuxtPage />
  </UApp>
</template>

<script lang="ts" setup>
import type { ToasterProps } from '@nuxt/ui/components/Toaster.vue';

const toaster: ToasterProps = { position: 'bottom-center' };
</script>
