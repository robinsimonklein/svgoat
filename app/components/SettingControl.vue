<template>
  <div class="group flex items-start gap-4">
    <div class="flex-1 pt-1">
      <slot />
    </div>
    <div class="invisible ml-auto flex items-center gap-2 group-hover:visible">
      <UTooltip v-if="description?.length" :text="description" :content="{ side: 'left', align: 'center' }">
        <UButton icon="i-lucide-circle-question-mark" variant="link" size="sm" />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  description?: string;
}>();
</script>
