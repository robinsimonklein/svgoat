<template>
  <div>
    <div ref="dropZoneRef" class="fixed inset-0 flex items-stretch">
      <div class="flex-1">
        <!-- FIGMA MODE -->
        <FigmaView v-if="store.mode === 'figma'" />

        <Preview v-else-if="store.mode === 'single' || store.mode === 'batch'" />

        <!-- EMPTY MODE -->
        <EmptyView v-else />
      </div>

      <div class="w-100 shrink-0 py-4 pr-4">
        <Sidebar />
      </div>
    </div>
    <div
      v-if="isOverDropZone"
      class="bg-default/70 pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
    >
      <UEmpty size="lg" title="Drop your SVG files here..." icon="i-lucide-arrow-up-to-line" variant="naked" />
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();

const store = useStore();
const figmaStore = useFigmaStore();
const { isConnected } = useFigma();

const dropZoneRef = useTemplateRef('dropZoneRef');

const pageTitle = computed(() => {
  const count = store.inputs.length;
  if (count === 0) return null;
  if (count === 1) {
    const name = store.displayFilenames[0];
    return name ? `${name} — SVGOAT` : '1 SVG • SVGOAT';
  }
  return `${count} SVGs • SVGOAT`;
});
useHead({ title: pageTitle });

const handleClipboardPaste = async () => {
  const items = await navigator.clipboard.read();
  if (!items?.length) return;

  const showFigmaNotConnected = () =>
    toast.add({
      title: 'Figma not connected',
      description: 'Connect your Figma account to import from a link.',
      color: 'neutral',
      icon: 'i-logos-figma',
    });

  // Detect a Figma object copied directly from the canvas (contains figmeta in HTML)
  for (const item of items) {
    if (!item.types.includes('text/html')) continue;
    const html = await item.getType('text/html').then(b => b.text());

    const figmeta = parseFigmaClipboard(html);
    if (figmeta) {
      if (!isConnected.value) {
        showFigmaNotConnected();
        return;
      }
      const nodeId = figmeta.nodeId.replaceAll(':', '-');
      await figmaStore.handleNewUrl(`https://www.figma.com/design/${figmeta.fileKey}?node-id=${nodeId}`);
      return;
    }
  }

  // Fall back to plain text: Figma URL or SVG markup
  let text = '';
  for (const item of items) {
    if (!item.types.includes('text/plain')) continue;
    text = await item.getType('text/plain').then(b => b.text());
    break;
  }

  if (!text) return;

  if (isFigmaUrl(text.trim())) {
    if (!isConnected.value) {
      showFigmaNotConnected();
      return;
    }
    await figmaStore.handleNewUrl(text.trim());
    return;
  }

  try {
    store.addFromText(text);
  } catch (e) {
    toast.add({ title: 'Not supported', description: (e as Error).message, color: 'error' });
  }
};

const handleFileDrop = async (files: File[] | null) => {
  if (!files?.length) return;

  try {
    await store.addFromFiles(files);
  } catch (e) {
    toast.add({ title: 'Not supported', description: (e as Error).message, color: 'error' });
  }
};

const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop: handleFileDrop });

defineShortcuts({
  meta_v: handleClipboardPaste,
  meta_backspace: store.clearInputs,
});
</script>

<style>
:root {
  --checkerboard-size: 8px;
  --checkerboard-color-1: var(--ui-bg);
  --checkerboard-color-2: var(--ui-bg-elevated);
}

.checkerboard {
  background-image:
    linear-gradient(45deg, var(--checkerboard-color-2) 25%, transparent 25%),
    linear-gradient(-45deg, var(--checkerboard-color-2) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--checkerboard-color-2) 75%),
    linear-gradient(-45deg, transparent 75%, var(--checkerboard-color-2) 75%);
  background-size: calc(var(--checkerboard-size) * 2) calc(var(--checkerboard-size) * 2);
  background-position:
    0 0,
    0 var(--checkerboard-size),
    var(--checkerboard-size) calc(var(--checkerboard-size) * -1),
    calc(var(--checkerboard-size) * -1) 0;
  background-color: var(--checkerboard-color-1);
}
</style>
