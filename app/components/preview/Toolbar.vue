<template>
  <div class="absolute bottom-4 left-1/2 w-[80%] max-w-180 -translate-x-1/2">
    <div
      class="preview-toolbar bg-default/85 border-default rounded-3xl border p-4 shadow-2xl shadow-black/10 backdrop-blur-2xl"
    >
      <div class="flex items-center gap-4">
        <div class="overflow-hidden">
          <div class="flex max-w-full items-center gap-1">
            <NuxtLink
              v-if="store.input?.source.type === 'figma'"
              class="inline-block leading-0"
              :to="store.input.source.fileUrl"
              target="_blank"
              external
            >
              <UIcon name="i-logos-figma" class="inline-block size-4" />
            </NuxtLink>
            <p class="truncate text-sm font-bold">
              <template v-if="store.mode === 'single'">
                <template v-if="store.displayFilename?.length">
                  {{ store.displayFilename }}
                </template>
                <template v-else><span class="italic">Pasted SVG</span></template>
              </template>
              <template v-else-if="store.mode === 'batch'">
                <span class="tabular-nums">{{ store.batchStats.count }}</span> file{{
                  store.batchStats.count > 1 ? 's' : ''
                }}
              </template>
            </p>
            <UTooltip v-if="rasterWarning" :text="rasterWarning" :content="{ side: 'top', align: 'center' }">
              <UIcon name="i-lucide-triangle-alert" class="text-warning size-4 shrink-0" />
            </UTooltip>
          </div>

          <div class="mt-0.5 flex items-center gap-2">
            <UBadge v-if="store.mode === 'single' && store.input" size="sm" color="neutral" variant="soft">
              {{ store.input.width }} x {{ store.input.height }}
            </UBadge>
            <p class="text-muted text-xs tabular-nums">
              {{ formatBytes(displayRawSize) }} →
              <span class="text-success">
                {{ formatBytes(displayOptimizedSize) }}
                <strong class="font-bold"> ({{ formatPercent(displayRawSize, displayOptimizedSize) }}) </strong>
              </span>
            </p>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <UButton
            v-if="isCopySupported && store.mode === 'single'"
            :label="copied ? 'Copied' : 'Copy'"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            variant="subtle"
            color="neutral"
            :disabled="!store.optimizedSvg"
            @click="copySvg(store.optimizedSvg!)"
          />
          <UButton
            :label="store.mode === 'batch' ? 'Download all (.zip)' : 'Download'"
            icon="i-lucide-download"
            color="neutral"
            :loading="isDownloading"
            :disabled="!store.optimizedItems.length"
            @click="download"
          />
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" square @click="store.clearInputs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useStore();
const preferencesStore = usePreferencesStore();
const { copied, isCopySupported, isDownloading, copySvg, downloadSvg, downloadAllAsZip } = useSvgActions();

const gzipRawSize = ref<number | null>(null);
const gzipOptimizedSize = ref<number | null>(null);

watch(
  [
    () => preferencesStore.preferences.showGzipped,
    () => store.inputs.map(i => i.text).join(),
    () => store.optimizedItems.map(i => i.text).join(),
  ],
  async ([enabled]) => {
    if (!enabled) {
      gzipRawSize.value = null;
      gzipOptimizedSize.value = null;
      return;
    }
    const [rawSizes, optimizedSizes] = await Promise.all([
      Promise.all(store.inputs.map(i => gzipSize(i.text))),
      Promise.all(store.optimizedItems.filter(i => i.text).map(i => gzipSize(i.text))),
    ]);
    gzipRawSize.value = rawSizes.reduce((sum, s) => sum + s, 0);
    gzipOptimizedSize.value = optimizedSizes.reduce((sum, s) => sum + s, 0);
  },
  { immediate: true },
);

const displayRawSize = computed(() =>
  preferencesStore.preferences.showGzipped && gzipRawSize.value !== null
    ? gzipRawSize.value
    : store.batchStats.totalRawSize,
);
const displayOptimizedSize = computed(() =>
  preferencesStore.preferences.showGzipped && gzipOptimizedSize.value !== null
    ? gzipOptimizedSize.value
    : store.batchStats.totalOptimizedSize,
);

const rasterWarning = computed(() => {
  if (store.mode === 'single') {
    return store.input && hasRasterImage(store.input.text)
      ? 'This SVG contains an embedded raster image (likely a PNG/JPG export mistakenly saved as SVG).'
      : null;
  }
  if (store.mode === 'batch') {
    const count = store.inputs.filter(i => hasRasterImage(i.text)).length;
    if (!count) return null;
    return `${count} file${count > 1 ? 's contain' : ' contains'} an embedded raster image (likely a PNG/JPG export mistakenly saved as SVG).`;
  }
  return null;
});

const download = () => {
  if (store.mode === 'single') {
    if (!store.optimizedSvg) return;
    downloadSvg(store.optimizedSvg, store.displayFilename || 'optimized.svg');
  } else {
    const filenames = store.displayFilenames.map((f, i) => f ?? `svg-${i + 1}.svg`);
    downloadAllAsZip(store.optimizedItems, filenames);
  }
};
</script>

<style scoped>
.preview-toolbar {
  animation-name: preview-toolbar;
  animation-duration: 300ms;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes preview-toolbar {
  0% {
    transform: scale(0.96) translate3d(0, 6px, 1px);
  }
  100% {
    transform: scale(1) translate3d(0, 0, 0);
  }
}
</style>
