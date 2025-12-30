import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env before importing config
vi.mock('../config/config', async () => {
  const originalModule = await vi.importActual('../config/config');
  return {
    ...originalModule,
    API_BASE_URL: 'http://localhost:5000'
  };
});

import { getImageUrl, getHeroImageUrl, getRoleIconUrl } from '../utils/urlHelpers';

describe('urlHelpers', () => {
  describe('getImageUrl', () => {
    it('returns empty string for null or undefined path', () => {
      expect(getImageUrl(null)).toBe('');
      expect(getImageUrl(undefined)).toBe('');
      expect(getImageUrl('')).toBe('');
    });

    it('returns the path unchanged if it starts with http', () => {
      const absoluteUrl = 'https://example.com/image.png';
      expect(getImageUrl(absoluteUrl)).toBe(absoluteUrl);
    });

    it('prepends API_BASE_URL for relative paths without leading slash', () => {
      expect(getImageUrl('uploads/hero.png')).toBe('http://localhost:5000/uploads/hero.png');
    });

    it('prepends API_BASE_URL for relative paths with leading slash', () => {
      expect(getImageUrl('/uploads/hero.png')).toBe('http://localhost:5000/uploads/hero.png');
    });
  });

  describe('getHeroImageUrl', () => {
    it('returns image URL from hero object', () => {
      const hero = { hero_image_path: 'uploads/layla.png' };
      expect(getHeroImageUrl(hero)).toBe('http://localhost:5000/uploads/layla.png');
    });

    it('returns empty string for hero without hero_image_path', () => {
      expect(getHeroImageUrl({})).toBe('');
      expect(getHeroImageUrl(null)).toBe('');
      expect(getHeroImageUrl(undefined)).toBe('');
    });
  });

  describe('getRoleIconUrl', () => {
    it('returns icon URL from hero object', () => {
      const hero = { role_icon_path: 'icons/marksman.png' };
      expect(getRoleIconUrl(hero)).toBe('http://localhost:5000/icons/marksman.png');
    });

    it('returns empty string for hero without role_icon_path', () => {
      expect(getRoleIconUrl({})).toBe('');
      expect(getRoleIconUrl(null)).toBe('');
      expect(getRoleIconUrl(undefined)).toBe('');
    });
  });
});

describe('config', () => {
  it('exports API_BASE_URL with fallback value', async () => {
    const { API_BASE_URL } = await import('../config/config');
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL).toContain('http');
  });

  it('exports API_URL derived from API_BASE_URL', async () => {
    const { API_URL, API_BASE_URL } = await import('../config/config');
    expect(API_URL).toBe(`${API_BASE_URL}/api`);
  });
});
