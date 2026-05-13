<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-5 p-6">
    <UIcon name="i-logos-figma" class="size-10" />

    <!-- Step: choice -->
    <div v-if="figmaStore.state.step === 'choice'" class="flex w-full max-w-sm flex-col items-center gap-5">
      <div class="ring-default bg-default w-full rounded-xl p-4 ring-1">
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ figmaStore.state.inspected.node.name }}</p>
            <div class="mt-1 flex items-center gap-1.5">
              <UBadge :label="figmaStore.state.inspected.node.type" color="neutral" variant="subtle" size="sm" />
              <span v-if="figmaStore.state.inspected.node.children?.length" class="text-muted text-xs">
                {{ figmaStore.state.inspected.node.children.length }} elements detected
              </span>
            </div>
          </div>
          <UButton
            size="sm"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            class="shrink-0"
            @click="figmaStore.reset"
          />
        </div>
      </div>

      <div class="w-full space-y-2">
        <p class="text-muted text-center text-xs">How do you want to import this selection?</p>
        <div
          class="grid gap-2"
          :class="figmaStore.state.inspected.node.children?.length ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <UButton
            icon="i-lucide-scan"
            label="Use selection"
            color="neutral"
            variant="outline"
            block
            @click="figmaStore.importParent"
          />
          <UButton
            v-if="figmaStore.state.inspected.node.children?.length"
            icon="i-lucide-layout-grid"
            :label="`Extract ${figmaStore.state.inspected.node.children.length} children`"
            color="neutral"
            block
            @click="figmaStore.importChildren"
          />
        </div>
      </div>
    </div>

    <!-- Step: inspect, extract or import -->
    <div v-else class="w-full max-w-xs space-y-2">
      <UProgress
        :model-value="figmaStore.state.step === 'import' ? figmaStore.state.current : null"
        :max="figmaStore.state.step === 'import' ? figmaStore.state.total : undefined"
        :status="figmaStore.state.step === 'import'"
        :get-value-label="(value, max) => `${value} / ${max}`"
        color="neutral"
      />
      <p class="text-muted text-center text-xs">
        {{
          figmaStore.state.step === 'inspect'
            ? 'Inspecting Figma file…'
            : figmaStore.state.step === 'extract'
              ? 'Extracting from Figma…'
              : 'Importing SVGs…'
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const figmaStore = useFigmaStore();
</script>
