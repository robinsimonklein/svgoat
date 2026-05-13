<template>
  <div class="relative h-full w-full">
    <div
      v-if="view === 'image'"
      ref="previewRef"
      class="checkerboard fixed inset-0 z-0 overflow-hidden"
      :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    >
      <div
        class="inline-block"
        :style="{
          width: store.input?.width ? `${store.input.width}px` : undefined,
          height: store.input?.height ? `${store.input.height}px` : undefined,
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
          transformOrigin: '0 0',
        }"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="SVG preview"
          :style="{
            width: store.input?.width ? `${store.input.width}px` : undefined,
            height: store.input?.height ? `${store.input.height}px` : undefined,
          }"
          class="pointer-events-none h-full w-full object-contain select-none"
        />
      </div>
    </div>
    <div v-else class="fixed inset-0 z-0 overflow-hidden pr-90">
      <LazyMarkup class="min-h-full w-full" :value="store.optimizedSvg!.trim()" />
    </div>

    <div class="absolute top-4 left-4 z-10 inline-flex flex-col items-start gap-2 leading-0 select-none">
      <UTooltip :text="view === 'image' ? 'View code' : 'Image preview'" :content="{ side: 'right', align: 'center' }">
        <UButton
          :icon="view === 'image' ? 'i-lucide-code-xml' : 'i-lucide-image'"
          size="lg"
          square
          :ui="{ base: 'rounded-full ' }"
          @click="toggleView"
        />
      </UTooltip>
      <template v-if="view === 'image'">
        <UTooltip text="Center image" :content="{ side: 'right', align: 'center' }">
          <UButton
            label="1:1"
            size="lg"
            square
            :ui="{ base: 'rounded-full min-w-9 justify-center' }"
            :disabled="
              scale === initialPosition.scale && translateX === initialPosition.x && translateY === initialPosition.y
            "
            @click="resetView"
          />
        </UTooltip>
        <UTooltip text="Zoom in" :content="{ side: 'right', align: 'center' }">
          <UButton icon="i-lucide-plus" size="lg" square :ui="{ base: 'rounded-full' }" @click="scaleUp" />
        </UTooltip>
        <UTooltip text="Zoom out" :content="{ side: 'right', align: 'center' }">
          <UButton
            icon="i-lucide-minus"
            size="lg"
            square
            :ui="{ base: 'rounded-full' }"
            :disabled="scale <= MIN_SCALE"
            @click="scaleDown"
          />
        </UTooltip>
      </template>
    </div>

    <div
      v-if="view === 'image'"
      class="absolute top-1/2 right-4 z-10 inline-flex -translate-y-1/2 flex-col gap-2"
    ></div>
  </div>
</template>

<script setup lang="ts">
const store = useStore();
const preferencesStore = usePreferencesStore();

const { width: viewportWidth, height: viewportHeight } = useWindowSize();

const previewRef = useTemplateRef('previewRef');

const view = ref<'image' | 'code'>('image');

const SCALE_FACTOR = 1.05;
const MIN_SCALE = 0.1;
const BUTTON_SCALE_FACTOR = 1.25;
const OFFSET_RIGHT = 360 + 16; // sidebar (w-90)
const OFFSET_LEFT = 16;
const OFFSET_TOP = 16;
const OFFSET_BOTTOM = 16;

// Position initiale : object-fit: contain dans la zone visible (viewport - offsets),
// avec transform-origin: 0 0 (coin sup. gauche de l'élément à (tx, ty)).
const initialPosition = computed(() => {
  const svgWidth = store.input?.width ?? 0;
  const svgHeight = store.input?.height ?? 0;
  const availableWidth = Math.max(0, viewportWidth.value - OFFSET_LEFT - OFFSET_RIGHT);
  const availableHeight = Math.max(0, viewportHeight.value - OFFSET_TOP - OFFSET_BOTTOM);

  const scale =
    svgWidth > 0 && svgHeight > 0 && availableWidth > 0 && availableHeight > 0
      ? Math.min(1, availableWidth / svgWidth, availableHeight / svgHeight)
      : 1;

  const scaledWidth = svgWidth * scale;
  const scaledHeight = svgHeight * scale;

  return {
    x: OFFSET_LEFT + (availableWidth - scaledWidth) / 2,
    y: OFFSET_TOP + (availableHeight - scaledHeight) / 2,
    scale,
  };
});

const isDragging = ref(false);
const dragStart = { x: 0, y: 0, tx: 0, ty: 0 };

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const zoomAtCenter = (factor: number) => {
  const cx = OFFSET_LEFT + (viewportWidth.value - OFFSET_LEFT - OFFSET_RIGHT) / 2;
  const cy = OFFSET_TOP + (viewportHeight.value - OFFSET_TOP - OFFSET_BOTTOM) / 2;
  const oldScale = scale.value;
  const newScale = Math.max(MIN_SCALE, Math.round(oldScale * factor * 100) / 100);
  const ratio = newScale / oldScale;
  translateX.value = translateX.value * ratio + (1 - ratio) * cx;
  translateY.value = translateY.value * ratio + (1 - ratio) * cy;
  scale.value = newScale;
};

const scaleUp = () => zoomAtCenter(BUTTON_SCALE_FACTOR);
const scaleDown = () => zoomAtCenter(1 / BUTTON_SCALE_FACTOR);

const resetView = () => {
  scale.value = initialPosition.value.scale;
  translateX.value = initialPosition.value.x;
  translateY.value = initialPosition.value.y;
};

const toggleView = () => {
  view.value = view.value === 'image' ? 'code' : 'image';
};

useEventListener(previewRef, 'mousedown', (e: MouseEvent) => {
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  dragStart.tx = translateX.value;
  dragStart.ty = translateY.value;
});

useEventListener(window, 'mousemove', (e: MouseEvent) => {
  if (!isDragging.value) return;
  translateX.value = dragStart.tx + (e.clientX - dragStart.x);
  translateY.value = dragStart.ty + (e.clientY - dragStart.y);
});

useEventListener(window, 'mouseup', () => {
  isDragging.value = false;
});

useEventListener(
  previewRef,
  'wheel',
  (e: WheelEvent) => {
    e.preventDefault();

    const oldScale = scale.value;
    const factor = e.deltaY < 0 ? SCALE_FACTOR : 1 / SCALE_FACTOR;
    const newScale = Math.max(MIN_SCALE, Math.round(oldScale * factor * 100) / 100);

    // Avec transform-origin: 0 0, le coin supérieur gauche est à (tx, ty).
    // Pour garder le point sous le curseur fixe : tx' = tx * ratio + (1 - ratio) * cx
    const ratio = newScale / oldScale;

    translateX.value = translateX.value * ratio + (1 - ratio) * e.clientX;
    translateY.value = translateY.value * ratio + (1 - ratio) * e.clientY;
    scale.value = newScale;
  },
  { passive: false },
);

watch(
  () => store.input?.text,
  () => {
    resetView();
    view.value = 'image';
  },
  { immediate: true },
);

const previewUrl = computed(() => {
  if (!store.optimizedSvg) return null;
  return buildSvgPreviewUrl(store.optimizedSvg, preferencesStore.debouncedSimulatedCurrentColor);
});

let previousUrl: string | null = null;
watch(previewUrl, newUrl => {
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  previousUrl = newUrl;
});
</script>
