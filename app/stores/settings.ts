import type { Config } from 'svgo/browser';
import { CUSTOM_PLUGINS } from '#shared/utils/customPlugins';

const FLOAT_PRECISION_PLUGINS = new Set(['cleanupNumericValues', 'convertPathData', 'cleanupListOfValues']);
const TRANSFORM_PRECISION_PLUGINS = new Set(['convertTransform', 'convertPathData']);

export const useSettingsStore = defineStore('settings', () => {
  const defaultSettings = (): SvgoSettings => ({
    floatPrecision: 3,
    transformPrecision: 5,
    multipass: false,
    plugins: Object.fromEntries(PLUGIN_DEFS.map(def => [def.name, { enabled: def.defaultEnabled }])),
  });

  const settings = useLocalStorage<SvgoSettings>('svgo-settings', defaultSettings(), {
    mergeDefaults: (storageValue, defaults) => ({
      ...defaults,
      ...storageValue,
      plugins: Object.fromEntries(
        Object.entries(defaults.plugins).map(([name, defaultPlugin]) => [
          name,
          { ...defaultPlugin, ...(storageValue.plugins?.[name] ?? {}) },
        ]),
      ),
    }),
  });

  const svgoConfig = computed<Config>(() => ({
    multipass: settings.value.multipass,
    plugins: PLUGIN_DEFS.filter(def => settings.value.plugins[def.name]?.enabled).map(def => {
      if (def.custom && CUSTOM_PLUGINS[def.name]) return CUSTOM_PLUGINS[def.name];

      const params: Record<string, number> = {};
      if (FLOAT_PRECISION_PLUGINS.has(def.name)) params.floatPrecision = settings.value.floatPrecision;
      if (TRANSFORM_PRECISION_PLUGINS.has(def.name)) params.transformPrecision = settings.value.transformPrecision;
      return Object.keys(params).length ? { name: def.name, params } : def.name;
    }) as Config['plugins'],
  }));

  const reset = () => {
    settings.value = defaultSettings();
  };

  return { settings, svgoConfig, reset };
});
