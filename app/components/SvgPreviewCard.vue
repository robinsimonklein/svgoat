<template>
  <div class="group border-default relative overflow-hidden rounded-xl border">
    <div class="checkerboard relative aspect-square p-4">
      <img v-if="previewUrl" :src="previewUrl" :alt="filename" class="h-full w-full object-contain" />

      <div
        class="bg-default/90 invisible absolute inset-0 flex items-center justify-center gap-2 p-4 group-hover:visible"
      >
        <UTooltip :text="copied ? 'Copied!' : 'Copy to clipboard'">
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            color="neutral"
            size="lg"
            variant="subtle"
            @click="copySvg(item.text)"
          />
        </UTooltip>
        <UTooltip text="Download file">
          <UButton icon="i-lucide-download" color="neutral" size="lg" @click="downloadSvg(item.text, filename)" />
        </UTooltip>
        <UButton
          class="absolute top-2 right-2"
          size="sm"
          icon="i-lucide-x"
          color="error"
          variant="soft"
          @click="$emit('remove')"
        />
      </div>
    </div>

    <div class="bg-default p-2">
      <div class="flex items-center gap-1.5">
        <UTooltip
          v-if="isRaster"
          text="This SVG contains an embedded raster image (likely a PNG/JPG export mistakenly saved as SVG)."
          :content="{ side: 'top', align: 'center' }"
        >
          <UIcon name="i-lucide-triangle-alert" class="text-warning size-3.5 shrink-0" />
        </UTooltip>
        <p :title="filename" class="truncate text-sm font-bold">{{ filename }}</p>
      </div>
      <p class="text-muted text-xs tabular-nums">
        <template v-if="displayRawSize !== null && displayOptimizedSize !== null">
          {{ formatBytes(displayOptimizedSize) }}
          <strong class="font-bold">({{ formatPercent(displayRawSize, displayOptimizedSize) }})</strong>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: OptimizedSvg;
  filename: string;
  rawText: string;
}>();

defineEmits<{
  remove: [];
}>();

const { copied, copySvg, downloadSvg } = useSvgActions();

const preferencesStore = usePreferencesStore();

const gzipRawSize = ref<number | null>(null);
const gzipOptimizedSize = ref<number | null>(null);

watch(
  [() => preferencesStore.preferences.showGzipped, () => props.item.text],
  async ([enabled]) => {
    if (!enabled) {
      gzipRawSize.value = null;
      gzipOptimizedSize.value = null;
      return;
    }
    [gzipRawSize.value, gzipOptimizedSize.value] = await Promise.all([
      gzipSize(props.rawText),
      gzipSize(props.item.text),
    ]);
  },
  { immediate: true },
);

const displayRawSize = computed(() =>
  preferencesStore.preferences.showGzipped && gzipRawSize.value !== null ? gzipRawSize.value : props.item.rawSize,
);
const displayOptimizedSize = computed(() =>
  preferencesStore.preferences.showGzipped && gzipOptimizedSize.value !== null
    ? gzipOptimizedSize.value
    : props.item.optimizedSize,
);

const previewUrl = computed(() => {
  if (!props.item.text) return null;
  return buildSvgPreviewUrl(props.item.text, preferencesStore.debouncedSimulatedCurrentColor);
});

const isRaster = computed(() => hasRasterImage(props.rawText));

let previousUrl: string | null = null;
watch(previewUrl, newUrl => {
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  previousUrl = newUrl;
});
</script>
