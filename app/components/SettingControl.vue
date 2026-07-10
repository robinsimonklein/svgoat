<template>
  <div class="group flex items-start gap-3">
    <div class="flex-1 pt-1">
      <slot />
    </div>
    <div class="ml-auto flex items-center gap-1">
      <UTooltip v-if="description?.length" :text="description" :content="{ side: 'left', align: 'center' }">
        <UButton
          class="invisible group-hover:visible"
          icon="i-lucide-circle-question-mark"
          variant="link"
          size="sm"
          square
        />
      </UTooltip>
      <UButton
        v-if="pluginName?.length"
        :icon="isFavorite ? 'i-heroicons-star-solid' : 'i-lucide-star'"
        variant="link"
        size="sm"
        square
        :class="isFavorite ? 'text-yellow-500' : 'invisible group-hover:visible'"
        @click="favoritesStore.toggle(pluginName)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  pluginName?: string;
  description?: string;
}>();

const favoritesStore = useFavoritesStore();

const isFavorite = computed(() => props.pluginName && favoritesStore.favorites.includes(props.pluginName));
</script>
