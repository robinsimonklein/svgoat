import { test, describe, expect } from 'vitest';
import { cleanFilename } from '../../app/utils/filename';

describe('cleanFilename', () => {
  describe('extension handling', () => {
    test('preserves .svg extension', () => {
      expect(cleanFilename('my-icon.svg')).toBe('my-icon.svg');
    });

    test('preserves other extensions', () => {
      expect(cleanFilename('my-icon.png')).toBe('my-icon.png');
    });

    test('works without extension', () => {
      expect(cleanFilename('my-icon')).toBe('my-icon');
    });
  });

  describe('Figma copy suffix', () => {
    test('removes "(copy)" suffix', () => {
      expect(cleanFilename('icon (copy).svg')).toBe('icon.svg');
    });

    test('removes "(copy 2)" suffix', () => {
      expect(cleanFilename('icon (copy 2).svg')).toBe('icon.svg');
    });

    test('removes "(Copy)" suffix (case insensitive)', () => {
      expect(cleanFilename('icon (Copy).svg')).toBe('icon.svg');
    });
  });

  describe('trailing number suffix', () => {
    test('removes trailing "(n)" suffix', () => {
      expect(cleanFilename('icon (3).svg')).toBe('icon.svg');
    });

    test('removes trailing "(12)" suffix', () => {
      expect(cleanFilename('icon (12).svg')).toBe('icon.svg');
    });
  });

  describe('Figma prefix tokens', () => {
    test('strips "Frame 1" prefix', () => {
      expect(cleanFilename('Frame 1 my-icon.svg')).toBe('my-icon.svg');
    });

    test('strips "Group 3" prefix', () => {
      expect(cleanFilename('Group 3 my-icon.svg')).toBe('my-icon.svg');
    });

    test('strips "Rectangle 12" prefix', () => {
      expect(cleanFilename('Rectangle 12 my-icon.svg')).toBe('my-icon.svg');
    });

    test('strips "Component 1" prefix', () => {
      expect(cleanFilename('Component 1 my-icon.svg')).toBe('my-icon.svg');
    });

    test('strips multiple consecutive Figma tokens', () => {
      expect(cleanFilename('Frame 1 Group 2 my-icon.svg')).toBe('my-icon.svg');
    });

    test('strips Figma token that is the whole name', () => {
      expect(cleanFilename('Frame 1.svg')).toBe('svg.svg');
    });
  });

  describe('slugification', () => {
    test('lowercases the stem', () => {
      expect(cleanFilename('MyIcon.svg')).toBe('myicon.svg');
    });

    test('replaces spaces with dashes', () => {
      expect(cleanFilename('my icon.svg')).toBe('my-icon.svg');
    });

    test('strips diacritics', () => {
      expect(cleanFilename('icône.svg')).toBe('icone.svg');
    });

    test('replaces special chars with dashes', () => {
      expect(cleanFilename('my_icon!name.svg')).toBe('my-icon-name.svg');
    });

    test('trims leading and trailing dashes', () => {
      expect(cleanFilename('--icon--.svg')).toBe('icon.svg');
    });

    test('collapses multiple separators into one dash', () => {
      expect(cleanFilename('my   icon.svg')).toBe('my-icon.svg');
    });
  });

  describe('fallback', () => {
    test('returns "svg" when stem is empty after cleaning', () => {
      expect(cleanFilename('.svg')).toBe('svg');
    });
  });

  describe('combined cases', () => {
    test('strips Figma prefix + copy suffix + slugifies', () => {
      expect(cleanFilename('Frame 1 My Icon (copy).svg')).toBe('my-icon.svg');
    });

    test('strips Figma prefix + trailing number + slugifies', () => {
      expect(cleanFilename('Group 2 Button Primary (3).svg')).toBe('button-primary.svg');
    });
  });
});
