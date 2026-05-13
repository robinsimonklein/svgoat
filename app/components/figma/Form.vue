<template>
  <!-- Figma connected -->
  <UCard v-if="isConnected">
    <div class="flex items-center">
      <div class="flex items-center gap-2">
        <UIcon name="i-logos-figma" class="size-4 shrink-0" />
        <span class="text-sm font-medium">Figma</span>
        <UBadge label="Connected" color="success" variant="subtle" size="sm" />
      </div>
      <UDropdownMenu
        class="ml-auto"
        :items="[
          {
            label: 'Disconnect',
            onSelect: disconnect,
          },
        ]"
        :content="{
          side: 'bottom',
          align: 'end',
        }"
      >
        <UButton size="sm" icon="i-lucide-ellipsis" color="neutral" variant="ghost" square />
      </UDropdownMenu>
    </div>
    <form class="mt-3 flex items-center gap-2" @submit.prevent="figmaStore.submit">
      <UInput v-model="figmaStore.url" type="text" placeholder="Paste a Figma link…" :ui="{ root: 'flex-1' }" />
      <UButton
        type="submit"
        label="Import"
        color="neutral"
        :loading="figmaStore.isLoading"
        :disabled="!figmaStore.url?.length"
      />
    </form>
  </UCard>

  <!-- Figma not connected -->
  <UCard v-else class="text-center">
    <div class="flex flex-col items-center gap-4 py-2">
      <UIcon name="i-logos-figma" class="size-10" />
      <div>
        <p class="text-sm font-medium">Import from Figma</p>
        <p class="text-muted mt-1 text-sm">
          Connect your account to import SVG elements directly from your Figma files
        </p>
      </div>
      <UButton label="Connect with Figma" color="neutral" :loading="isConnecting" @click="connect" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { isConnecting, isConnected, connect, disconnect } = useFigma();
const figmaStore = useFigmaStore();
</script>
