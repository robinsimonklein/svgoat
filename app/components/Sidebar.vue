<template>
  <div class="border-default bg-default relative z-10 flex h-full flex-col rounded-3xl border">
    <!-- Header-->
    <div class="flex items-center p-6">
      <div>
        <h1 class="group text-xl font-extrabold">
          SV<span class="relative inline-block">
            GOAT
            <span
              class="pointer-events-none absolute inset-0 animate-[rainbow_1.5s_linear_infinite] bg-[linear-gradient(90deg,#e8756a,#e8a86a,#e8e06a,#6abf7a,#6a8fe8,#a86ae8,#e8756a)] bg-size-[200%] bg-clip-text text-transparent opacity-0 transition-opacity duration-500 select-none group-hover:opacity-100"
              aria-hidden="true"
            >
              GOAT
            </span>
          </span>
        </h1>
        <p class="text-muted text-xs">
          v{{ appVersion }} – Powered by
          <ULink to="https://github.com/svg/svgo" target="_blank" external inactive-class="text-info">svgo</ULink>
        </p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <div :style="{ '--chip-color': preferencesStore.preferences.simulatedCurrentColor }">
          <UPopover>
            <UChip :show="preferencesStore.preferences.enableSimulatedCurrentColor" :ui="{ base: 'bg-(--chip-color)' }">
              <UButton icon="i-lucide-paintbrush" color="neutral" variant="subtle" />
            </UChip>

            <template #content>
              <ThemePreferences />
            </template>
          </UPopover>
        </div>
        <UDropdownMenu
          :items="[[{ label: 'Reset settings', icon: 'i-lucide-rotate-ccw', color: 'error', onSelect: resetSettings }]]"
          :content="{
            side: 'bottom',
            align: 'end',
          }"
        >
          <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Settings -->
    <div class="bg-muted mx-2 mb-2 flex-1 overflow-y-auto rounded-2xl px-3 py-3">
      <div class="mb-4 flex items-center gap-2">
        <h2 class="font-bold">Settings</h2>
      </div>
      <div class="space-y-6">
        <div class="space-y-3">
          <p class="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">Global</p>
          <USwitch v-model="settingsStore.settings.multipass" size="lg" label="Multipass" />
          <USwitch v-model="preferencesStore.preferences.prettify" size="lg" label="Prettify output" />
          <USwitch v-model="preferencesStore.preferences.showGzipped" size="lg" label="Show gzipped size" />
          <UFormField
            :label="`Number precision: ${settingsStore.settings.floatPrecision}`"
            :ui="{ label: 'tabular-nums' }"
          >
            <USlider v-model="settingsStore.settings.floatPrecision" :min="0" :max="8" class="w-full" />
          </UFormField>
          <UFormField
            :label="`Transform precision: ${settingsStore.settings.transformPrecision}`"
            :ui="{ label: 'tabular-nums' }"
          >
            <USlider v-model="settingsStore.settings.transformPrecision" :min="0" :max="8" class="w-full" />
          </UFormField>
        </div>

        <div class="space-y-3">
          <p class="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">Export</p>
          <USwitch v-model="preferencesStore.preferences.cleanFilenames" size="lg" label="Clean file names" />
        </div>

        <div v-for="[category, defs] in pluginsByCategory" :key="category">
          <p class="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">{{ CATEGORY_LABELS[category] }}</p>
          <div class="space-y-3">
            <div v-for="def in defs" :key="def.name">
              <USwitch v-model="settingsStore.settings.plugins[def.name]!.enabled" size="lg" :label="def.label" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PluginCategory } from '#shared/types/svgo';

const toast = useToast();

const settingsStore = useSettingsStore();
const preferencesStore = usePreferencesStore();

const {
  public: { appVersion },
} = useRuntimeConfig();

const CATEGORY_LABELS: Record<PluginCategory, string> = {
  metadata: 'Metadata & document',
  styles: 'Styles',
  ids: 'IDs & references',
  colors: 'Colors',
  numbers: 'Numbers & paths',
  shapes: 'Shapes & structure',
  dimensions: 'Dimensions & viewport',
  content: 'Content removal',
  output: 'Output',
};

const pluginsByCategory = computed(() => {
  const map = new Map<PluginCategory, typeof PLUGIN_DEFS>();
  for (const def of PLUGIN_DEFS) {
    if (!map.has(def.category)) map.set(def.category, []);
    map.get(def.category)!.push(def);
  }
  return map;
});

const resetSettings = () => {
  settingsStore.reset();
  toast.add({ title: 'Default settings applied', color: 'success', icon: 'i-lucide-check' });
};
</script>
