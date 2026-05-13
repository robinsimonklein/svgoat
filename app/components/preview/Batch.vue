<template>
  <div class="h-full overflow-hidden">
    <UScrollArea
      ref="batchScrollArea"
      v-slot="{ item }"
      :items="batchItems"
      :virtualize="{
        gap: GAP,
        lanes,
        estimateSize,
        skipMeasurement: true,
        paddingEnd: 72 + 16,
      }"
      class="h-full p-4"
    >
      <SvgPreviewCard
        :item="item"
        :filename="item.filename"
        :raw-text="item.rawText"
        @remove="store.removeInput(item.index)"
      />
    </UScrollArea>
  </div>
</template>

<script setup lang="ts">
const store = useStore();

// Batch mode virtualization
const GAP = 16;
const MIN_CARD_WIDTH = 160;
const INFO_HEIGHT = 52;

const batchScrollArea = useTemplateRef('batchScrollArea');
const { width: batchAreaWidth } = useElementSize(() => batchScrollArea.value?.$el);

const lanes = computed(() => Math.max(1, Math.floor(batchAreaWidth.value / (MIN_CARD_WIDTH + GAP))));
const laneWidth = computed(() => (batchAreaWidth.value - (lanes.value - 1) * GAP) / lanes.value);
const estimateSize = computed(() => laneWidth.value + INFO_HEIGHT);

const batchItems = computed(() =>
  store.optimizedItems.map((item, index) => ({
    ...item,
    filename: store.displayFilenames[index] ?? `SVG ${index + 1}`,
    rawText: store.inputs[index]?.text ?? '',
    index,
  })),
);
</script>
