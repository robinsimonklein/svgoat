import { test, describe, expect } from 'vitest';
import { PLUGIN_DEFS } from '../../shared/utils/plugins';
import { CUSTOM_PLUGINS } from '../../shared/utils/customPlugins';

const VALID_CATEGORIES = ['metadata', 'styles', 'ids', 'colors', 'numbers', 'shapes', 'dimensions', 'content', 'output'];

describe('PLUGIN_DEFS', () => {
  test('every entry has required fields', () => {
    for (const def of PLUGIN_DEFS) {
      expect(def.name, `${def.name}: missing name`).toBeTruthy();
      expect(def.label, `${def.name}: missing label`).toBeTruthy();
      expect(def.description, `${def.name}: missing description`).toBeTruthy();
      expect(typeof def.defaultEnabled, `${def.name}: defaultEnabled must be boolean`).toBe('boolean');
      expect(VALID_CATEGORIES, `${def.name}: invalid category`).toContain(def.category);
    }
  });

  test('no duplicate plugin names', () => {
    const names = PLUGIN_DEFS.map(d => d.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  test('custom plugins exist in CUSTOM_PLUGINS', () => {
    const customDefs = PLUGIN_DEFS.filter(d => d.custom);
    for (const def of customDefs) {
      expect(CUSTOM_PLUGINS, `${def.name} is custom:true but missing from CUSTOM_PLUGINS`).toHaveProperty(def.name);
    }
  });

  test('CUSTOM_PLUGINS entries are all declared as custom:true in PLUGIN_DEFS', () => {
    for (const key of Object.keys(CUSTOM_PLUGINS)) {
      const def = PLUGIN_DEFS.find(d => d.name === key);
      expect(def, `${key} is in CUSTOM_PLUGINS but not in PLUGIN_DEFS`).toBeDefined();
      expect(def?.custom, `${key} is in CUSTOM_PLUGINS but not marked custom:true`).toBe(true);
    }
  });
});

describe('CUSTOM_PLUGINS', () => {
  test('every entry has a name and fn', () => {
    for (const [key, plugin] of Object.entries(CUSTOM_PLUGINS)) {
      expect(plugin.name).toBe(key);
      expect(typeof plugin.fn).toBe('function');
    }
  });
});
