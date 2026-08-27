import type { Config as SvgoConfig } from 'svgo/browser';
import { CUSTOM_PLUGINS } from '#shared/utils/customPlugins';

const FLOAT_PRECISION_PLUGINS = new Set(['cleanupNumericValues', 'convertPathData', 'cleanupListOfValues']);
const TRANSFORM_PRECISION_PLUGINS = new Set(['convertTransform', 'convertPathData']);

export const useConfigStore = defineStore('config', () => {
  const defaultConfig = (): Config => ({
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    floatPrecision: 3,
    transformPrecision: 5,
    multipass: false,
    prettify: false,
    plugins: Object.fromEntries(PLUGIN_DEFS.map(def => [def.name, { enabled: def.defaultEnabled }])),
  });

  const config = useLocalStorage<Config>('config', defaultConfig(), {
    mergeDefaults: (storageValue, defaults) => {
      const fromVersion = (storageValue as { schemaVersion?: number }).schemaVersion ?? 0;
      const migrated = migrateSettings(storageValue, fromVersion);
      return {
        ...defaults,
        ...migrated,
        schemaVersion: SETTINGS_SCHEMA_VERSION,
        plugins: Object.fromEntries(
          Object.entries(defaults.plugins).map(([name, defaultPlugin]) => [
            name,
            { ...defaultPlugin, ...(migrated.plugins?.[name] ?? {}) },
          ]),
        ),
      };
    },
  });

  const svgoConfig = computed<SvgoConfig>(() => ({
    multipass: config.value.multipass,
    js2svg: config.value.prettify ? { pretty: true, indent: 2 } : {},
    plugins: PLUGIN_DEFS.filter(def => config.value.plugins[def.name]?.enabled).map(def => {
      if (def.custom && CUSTOM_PLUGINS[def.name]) return CUSTOM_PLUGINS[def.name];

      const params: Record<string, number> = {};
      if (FLOAT_PRECISION_PLUGINS.has(def.name)) params.floatPrecision = config.value.floatPrecision;
      if (TRANSFORM_PRECISION_PLUGINS.has(def.name)) params.transformPrecision = config.value.transformPrecision;
      return Object.keys(params).length ? { name: def.name, params } : def.name;
    }) as SvgoConfig['plugins'],
  }));

  let suppressTracking = false;

  const track = (setting: string, value: unknown) => {
    if (suppressTracking) return;
    trackEvent('settings_changed', { setting, value });
  };

  watch(
    () => config.value.multipass,
    value => track('multipass', value),
  );
  watch(
    () => config.value.prettify,
    value => track('prettify', value),
  );
  watchDebounced(
    () => config.value.floatPrecision,
    value => track('floatPrecision', value),
    { debounce: 500 },
  );
  watchDebounced(
    () => config.value.transformPrecision,
    value => track('transformPrecision', value),
    { debounce: 500 },
  );
  for (const def of PLUGIN_DEFS) {
    watch(
      () => config.value.plugins[def.name]?.enabled,
      value => {
        if (value === undefined) return;
        track(def.name, value);
      },
    );
  }

  const reset = () => {
    suppressTracking = true;
    config.value = defaultConfig();
    // Keep suppressed past the debounce window on the precision watchers above.
    setTimeout(() => {
      suppressTracking = false;
    }, 600);
  };

  return { config, svgoConfig, reset };
});
