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

  const reset = () => {
    config.value = defaultConfig();
  };

  return { config, svgoConfig, reset };
});
