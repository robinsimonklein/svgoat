<template>
  <div class="flex h-full items-center justify-center p-4">
    <div class="mx-auto w-full max-w-2xl">
      <UEmpty
        icon="i-lucide-arrow-up-from-line"
        title="Drop your SVG files here"
        description="One or multiple files at a time"
      >
        <template #actions>
          <div>
            <UButton label="Browse files" icon="i-lucide-folder-open" color="neutral" @click="fileInputRef?.click()" />
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            class="hidden"
            @change="onFileInput"
          />
        </template>
        <template #footer>
          <p class="text-muted text-xs">Paste with <UKbd value="meta" /> + <UKbd>V</UKbd></p>
        </template>
      </UEmpty>

      <USeparator label="or" class="my-8" type="dashed" />

      <FigmaForm />
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useStore();
const toast = useToast();

const fileInputRef = useTemplateRef<HTMLInputElement>('fileInputRef');

const onFileInput = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (!files.length) return;
  try {
    await store.addFromFiles(files);
  } catch (err) {
    toast.add({ title: 'Not supported', description: (err as Error).message, color: 'error' });
  }
  (e.target as HTMLInputElement).value = '';
};
</script>
