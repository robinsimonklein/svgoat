import { test, describe, expect } from 'vitest';
import { hasRasterImage } from '../../app/utils/svg';

describe('hasRasterImage', () => {
  test('detects a PNG data URI in href', () => {
    const svg = '<svg><image href="data:image/png;base64,abc"/></svg>';
    expect(hasRasterImage(svg)).toBe(true);
  });

  test('detects a JPEG data URI in xlink:href', () => {
    const svg = '<svg><image xlink:href="data:image/jpeg;base64,abc"/></svg>';
    expect(hasRasterImage(svg)).toBe(true);
  });

  test('detects a .png file reference', () => {
    const svg = '<svg><image href="assets/photo.png"/></svg>';
    expect(hasRasterImage(svg)).toBe(true);
  });

  test('detects a .jpg file reference', () => {
    const svg = '<svg><image href="photo.jpg"/></svg>';
    expect(hasRasterImage(svg)).toBe(true);
  });

  test('detects a .webp file reference', () => {
    const svg = '<svg><image href="photo.webp"/></svg>';
    expect(hasRasterImage(svg)).toBe(true);
  });

  test('returns false for an SVG with no images', () => {
    const svg = '<svg><circle r="10"/></svg>';
    expect(hasRasterImage(svg)).toBe(false);
  });

  test('returns false for an inline SVG image reference', () => {
    const svg = '<svg><image href="icon.svg"/></svg>';
    expect(hasRasterImage(svg)).toBe(false);
  });

  test('returns false for an SVG data URI', () => {
    const svg = '<svg><image href="data:image/svg+xml;base64,abc"/></svg>';
    expect(hasRasterImage(svg)).toBe(false);
  });
});
