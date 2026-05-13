import type { CustomPlugin } from 'svgo/browser';

const COLOR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];

const SKIP_VALUES = new Set(['none', 'currentColor', 'inherit', 'transparent']);

const isColorValue = (value: string): boolean => {
  const v = value.trim();
  if (!v || SKIP_VALUES.has(v)) return false;
  if (v.startsWith('url(')) return false;
  return true;
};

const CSS_COLOR_RE = new RegExp(`(${COLOR_ATTRS.join('|')})\\s*:\\s*([^;}{]+)`, 'g');

const replaceCssColors = (css: string): string =>
  css.replace(CSS_COLOR_RE, (match, prop: string, value: string) =>
    isColorValue(value.trim()) ? `${prop}: currentColor` : match,
  );

export const convertColorsToCurrentColor: CustomPlugin = {
  name: 'convertColorsToCurrentColor',
  fn: () => ({
    element: {
      enter: node => {
        for (const attr of COLOR_ATTRS) {
          if (attr in node.attributes && isColorValue(node.attributes[attr])) {
            node.attributes[attr] = 'currentColor';
          }
        }

        if (node.attributes.style) {
          node.attributes.style = replaceCssColors(node.attributes.style);
        }
      },
    },
    text: {
      enter: (node, parentNode) => {
        if (parentNode.type === 'element' && parentNode.name === 'style') {
          node.value = replaceCssColors(node.value);
        }
      },
    },
  }),
};

export const CUSTOM_PLUGINS: Record<string, CustomPlugin> = {
  convertColorsToCurrentColor,
};
