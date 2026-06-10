import { test, describe, expect } from 'vitest';
import { parseSvg, extractSvgs } from '#imports';

const SIMPLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle r="10"/></svg>';
const VIEWBOX_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect/></svg>';
const NO_DIMS_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>';

describe('parseSvg', () => {
  test('parses a valid SVG with width/height', () => {
    const result = parseSvg(SIMPLE_SVG);
    expect(result.width).toBe(24);
    expect(result.height).toBe(24);
    expect(result.markup).toContain('<svg');
  });

  test('extracts dimensions from viewBox when width/height are absent', () => {
    const result = parseSvg(VIEWBOX_SVG);
    expect(result.width).toBe(48);
    expect(result.height).toBe(48);
  });

  test('returns 0x0 when no dimensions are present', () => {
    const result = parseSvg(NO_DIMS_SVG);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  test('throws on invalid XML', () => {
    expect(() => parseSvg('<svg><unclosed')).toThrow('Invalid XML');
  });

  test('throws when root element is not <svg>', () => {
    expect(() => parseSvg('<div>not an svg</div>')).toThrow('not an SVG');
  });
});

describe('extractSvgs', () => {
  test('returns a single SVG wrapped in an array', () => {
    const results = extractSvgs(SIMPLE_SVG);
    expect(results).toHaveLength(1);
    expect(results[0].width).toBe(24);
  });

  test('extracts multiple top-level SVGs from pasted text', () => {
    const multi = `${SIMPLE_SVG}\n${VIEWBOX_SVG}`;
    const results = extractSvgs(multi);
    expect(results).toHaveLength(2);
    expect(results[0].width).toBe(24);
    expect(results[1].width).toBe(48);
  });

  test('throws when the input contains no SVG element', () => {
    expect(() => extractSvgs('<div>not an svg</div>')).toThrow();
  });
});
