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
    <div class="bg-muted mx-2 mb-2 flex-1 space-y-6 overflow-y-auto rounded-2xl px-3 py-3">
      <div>
        <div class="mb-4 flex items-center gap-2">
          <h2 class="font-bold">Global</h2>
        </div>
        <div class="space-y-4">
          <SettingControl description="Runs the optimizer multiple times until no further reduction is possible">
            <USwitch v-model="configStore.config.multipass" size="lg" label="Multipass" />
          </SettingControl>
          <SettingControl description="Adds indentation to the output for readability">
            <USwitch v-model="configStore.config.prettify" size="lg" label="Prettify output" />
          </SettingControl>
          <SettingControl description="Shows the estimated gzip-compressed file size alongside the raw size">
            <USwitch v-model="preferencesStore.preferences.showGzipped" size="lg" label="Show gzipped size" />
          </SettingControl>
          <UFormField :label="`Number precision: ${configStore.config.floatPrecision}`" :ui="{ label: 'tabular-nums' }">
            <USlider v-model="configStore.config.floatPrecision" :min="0" :max="8" class="w-full" />
          </UFormField>
          <UFormField
            :label="`Transform precision: ${configStore.config.transformPrecision}`"
            :ui="{ label: 'tabular-nums' }"
          >
            <USlider v-model="configStore.config.transformPrecision" :min="0" :max="8" class="w-full" />
          </UFormField>
          <SettingControl
            description="Strips Figma artifacts (frame/group prefixes, copy suffixes) and slugifies file names on export"
          >
            <USwitch v-model="preferencesStore.preferences.cleanFilenames" size="lg" label="Clean file names" />
          </SettingControl>
        </div>
      </div>
      <div v-if="favoritePlugins.length > 0">
        <div class="mb-4 flex items-center gap-2">
          <h2 class="font-bold">Favorites</h2>
        </div>
        <div class="space-y-3">
          <div v-for="def in favoritePlugins" :key="def.name">
            <SettingControl :plugin-name="def.name" :description="def.description">
              <USwitch v-model="configStore.config.plugins[def.name]!.enabled" size="lg" :label="def.label" />
            </SettingControl>
          </div>
        </div>
      </div>
      <div>
        <div class="mb-4 flex items-center gap-2">
          <h2 class="font-bold">Settings</h2>
        </div>
        <div class="space-y-6">
          <div v-for="[category, defs] in pluginsByCategory" :key="category">
            <p class="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
              {{ CATEGORY_LABELS[category] }}
            </p>
            <div class="space-y-3">
              <div v-for="def in defs" :key="def.name">
                <SettingControl :plugin-name="def.name" :description="def.description">
                  <USwitch v-model="configStore.config.plugins[def.name]!.enabled" size="lg" :label="def.label" />
                </SettingControl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PluginCategory } from '../../shared/types/config';

const toast = useToast();

const configStore = useConfigStore();
const preferencesStore = usePreferencesStore();
const favoritesStore = useFavoritesStore();

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

const favoritePlugins = computed(() => {
  return favoritesStore.favorites.map(pluginName => PLUGIN_DEFS.find(p => p.name === pluginName)).filter(p => !!p);
});

const resetSettings = () => {
  configStore.reset();
  toast.add({ title: 'Default settings applied', color: 'success', icon: 'i-lucide-check' });
};
</script>
