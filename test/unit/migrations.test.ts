import { test, describe, expect } from 'vitest';
import { migrateSettings, SETTINGS_SCHEMA_VERSION } from '../../shared/utils/migrations';

describe('migrateSettings', () => {
  test('returns settings unchanged when already at current version', () => {
    const settings = { schemaVersion: SETTINGS_SCHEMA_VERSION, floatPrecision: 3 };
    const result = migrateSettings(settings, SETTINGS_SCHEMA_VERSION);
    expect(result).toEqual(settings);
  });

  test('returns settings unchanged when no migrations are registered (v0 → current)', () => {
    const settings = { floatPrecision: 2, multipass: true };
    const result = migrateSettings(settings, 0);
    expect(result).toEqual(settings);
  });

  test('preserves all existing fields', () => {
    const settings = { schemaVersion: 0, floatPrecision: 3, transformPrecision: 5, multipass: false, prettify: true };
    const result = migrateSettings(settings);
    expect(result).toMatchObject(settings);
  });

  test('handles fromVersion defaulting to 0', () => {
    const settings = { floatPrecision: 4 };
    expect(() => migrateSettings(settings)).not.toThrow();
  });
});
