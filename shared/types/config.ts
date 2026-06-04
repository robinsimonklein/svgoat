export type PluginCategory =
  | 'metadata'
  | 'styles'
  | 'ids'
  | 'colors'
  | 'numbers'
  | 'shapes'
  | 'dimensions'
  | 'content'
  | 'output';

export type PluginDef = {
  name: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  category: PluginCategory;
  custom?: boolean;
};

export type PluginState = {
  enabled: boolean;
};

export type Config = {
  schemaVersion: number;
  floatPrecision: number;
  transformPrecision: number;
  multipass: boolean;
  prettify: boolean;
  plugins: Record<string, PluginState>;
};
