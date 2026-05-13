<template>
  <div class="h-full w-full overflow-auto" v-html="code" />
</template>

<script setup lang="ts">
import { codeToHtml } from 'shiki';

const props = defineProps<{
  value: string;
}>();

const code = asyncComputed(() => {
  if (!props.value?.length) return '';

  return codeToHtml(props.value, {
    lang: 'html',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  });
});
</script>

<style>
@reference '~/assets/css/main.css';

.shiki {
  @apply relative min-h-full w-full !bg-transparent px-4 pt-16 pb-26 pl-21 whitespace-pre-wrap;
}

.shiki:before {
  @apply bg-elevated absolute top-0 bottom-0 left-0 w-17 content-[''];
}

.shiki code {
  counter-reset: line;
  counter-increment: line 0;
}

.shiki code .line {
  position: relative;
}

.shiki code .line::before {
  @apply text-muted absolute -left-21 block w-17 px-2 text-right font-mono content-[counter(line)];
  counter-increment: line;
}
</style>
