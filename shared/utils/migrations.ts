import type { Config } from '../types/config';

export const SETTINGS_SCHEMA_VERSION = 1;

type MigrationFn = (_settings: Record<string, unknown>) => Record<string, unknown>;

// Add one entry per breaking change to the Config schema.
// The key is the version *from* which we migrate (e.g. 1 → migration from v1 to v2).
// Example : { 1: s => ({ ...s, newKey: s.oldKey }) }
const migrations: Record<number, MigrationFn> = {};

export function migrateSettings(stored: unknown, fromVersion = 0): Config {
  let settings: Record<string, unknown> = { ...(stored as Record<string, unknown>) };
  let version = fromVersion;

  while (version < SETTINGS_SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (migrate) settings = migrate(settings);
    version++;
  }

  return settings as Config;
}
