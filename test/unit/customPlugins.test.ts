import { test, describe, expect } from 'vitest';
import { optimize, type Config } from 'svgo';
import { removeViewBoxClipPath } from '../../shared/utils/customPlugins';

// Combine our plugin with the standard cleanups (enabled by default) that then
// remove the emptied groups/defs, as in real conditions.
const run = (svg: string, only = false): string =>
  optimize(svg, {
    plugins: only
      ? [removeViewBoxClipPath]
      : [removeViewBoxClipPath, 'collapseGroups', 'removeEmptyContainers', 'removeUselessDefs'],
  } as Config).data;

// Example SVG from Figma: two nested "frame" clipPaths.
const FIGMA_EXAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32">
  <g clip-path="url(#a)">
    <g clip-path="url(#b)">
      <path fill="#f00" d="M15.996 31.994c8.837 0 16-7.164 16-16s-7.163-16-16-16-16 7.163-16 16 7.164 16 16 16"/>
    </g>
  </g>
  <defs>
    <clipPath id="a"><path fill="#fff" d="M0 0h32v32H0z"/></clipPath>
    <clipPath id="b"><path fill="#fff" d="M0 0h32v32H0z"/></clipPath>
  </defs>
</svg>`;

describe('removeViewBoxClipPath', () => {
  test('removes redundant Figma frame clip-paths (path form) and their defs', () => {
    const out = run(FIGMA_EXAMPLE);
    expect(out).not.toContain('clip-path');
    expect(out).not.toContain('clipPath');
    expect(out).not.toContain('<defs');
    // the actual content is preserved
    expect(out).toContain('M15.996 31.994');
    expect(out).toContain('#f00');
  });

  test('handles the <rect> form of a full-frame clip', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g clip-path="url(#c)"><circle cx="12" cy="12" r="10" fill="#000"/></g>
      <defs><clipPath id="c"><rect width="24" height="24"/></clipPath></defs>
    </svg>`;
    const out = run(svg);
    expect(out).not.toContain('clip-path');
    expect(out).not.toContain('clipPath');
    expect(out).toContain('<circle');
  });

  test('keeps a clip-path that is SMALLER than the viewBox (could hide content)', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g>
      <defs><clipPath id="a"><rect width="16" height="16"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    expect(out).toContain('clip-path');
    expect(out).toContain('clipPath');
  });

  test('keeps the clip when a transform sits on the referencing element', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g transform="translate(4 4)" clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g>
      <defs><clipPath id="a"><path d="M0 0h32v32H0z"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    expect(out).toContain('clip-path');
  });

  test('keeps the clip when a transform sits on an ancestor', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g transform="rotate(45 16 16)"><g clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g></g>
      <defs><clipPath id="a"><path d="M0 0h32v32H0z"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    expect(out).toContain('clip-path');
  });

  test('keeps the clip when clipPathUnits is objectBoundingBox', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g>
      <defs><clipPath id="a" clipPathUnits="objectBoundingBox"><rect width="1" height="1"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    expect(out).toContain('clip-path');
  });

  test('keeps a clip whose shape is not an axis-aligned rectangle', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g>
      <defs><clipPath id="a"><circle cx="16" cy="16" r="16"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    expect(out).toContain('clip-path');
  });

  test('does not remove a clipPath def still referenced elsewhere', () => {
    // #a is referenced by two elements; only one has a transform-free chain.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <g clip-path="url(#a)"><rect width="32" height="32" fill="#000"/></g>
      <g transform="translate(1 1)" clip-path="url(#a)"><rect width="32" height="32" fill="#111"/></g>
      <defs><clipPath id="a"><path d="M0 0h32v32H0z"/></clipPath></defs>
    </svg>`;
    const out = run(svg, true);
    // the transformed reference remains, so the def stays
    expect(out).toContain('clipPath');
    expect(out).toContain('url(#a)');
  });
});
