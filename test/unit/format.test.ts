import { test, describe, expect } from 'vitest';
import { formatBytes, formatPercent } from '../../app/utils/format';

describe('formatBytes', () => {
  test('returns "0 B" for 0', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  test('formats bytes', () => {
    expect(formatBytes(512)).toBe('512.0 B');
  });

  test('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  test('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  test('rounds to one decimal', () => {
    expect(formatBytes(1500)).toBe('1.5 KB');
  });
});

describe('formatPercent', () => {
  test('returns empty string when rawSize is 0', () => {
    expect(formatPercent(0, 500)).toBe('');
  });

  test('returns reduction percentage', () => {
    expect(formatPercent(1000, 500)).toBe('-50.0%');
  });

  test('returns 0% when sizes are equal', () => {
    expect(formatPercent(1000, 1000)).toBe('-0.0%');
  });

  test('handles near-100% reduction', () => {
    expect(formatPercent(1000, 1)).toBe('-99.9%');
  });
});
