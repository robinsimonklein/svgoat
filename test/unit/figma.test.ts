import { test, describe, expect } from 'vitest';
import { isFigmaUrl, parseFigmaClipboard } from '../../shared/utils/figma';

describe('isFigmaUrl', () => {
  test('accepts a figma.com/design URL with node-id', () => {
    expect(isFigmaUrl('https://www.figma.com/design/abc123/My-File?node-id=1-2')).toBe(true);
  });

  test('accepts a figma.com/file URL with node-id', () => {
    expect(isFigmaUrl('https://www.figma.com/file/abc123/My-File?node-id=1-2')).toBe(true);
  });

  test('rejects a URL without node-id', () => {
    expect(isFigmaUrl('https://www.figma.com/design/abc123/My-File')).toBe(false);
  });

  test('rejects a non-Figma URL', () => {
    expect(isFigmaUrl('https://example.com')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isFigmaUrl('')).toBe(false);
  });
});

describe('parseFigmaClipboard', () => {
  const makeHtml = (payload: object) => {
    const encoded = btoa(JSON.stringify(payload));
    return `<meta charset="utf-8"><span>(figmeta)${encoded}(/figmeta)</span>`;
  };

  test('parses a valid figmeta payload', () => {
    const html = makeHtml({ fileKey: 'abc123', selectedNodeData: '1:2|extra' });
    expect(parseFigmaClipboard(html)).toEqual({ fileKey: 'abc123', nodeId: '1:2' });
  });

  test('returns null when figmeta is absent', () => {
    expect(parseFigmaClipboard('<p>no figmeta here</p>')).toBeNull();
  });

  test('returns null when fileKey is missing', () => {
    const html = makeHtml({ selectedNodeData: '1:2' });
    expect(parseFigmaClipboard(html)).toBeNull();
  });

  test('returns null when selectedNodeData is missing', () => {
    const html = makeHtml({ fileKey: 'abc123' });
    expect(parseFigmaClipboard(html)).toBeNull();
  });

  test('returns null for invalid base64', () => {
    expect(parseFigmaClipboard('(figmeta)!!invalid!!(⁠/figmeta)')).toBeNull();
  });
});
