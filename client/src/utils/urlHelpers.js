import { API_BASE_URL } from '../config/config';

/**
 * Constructs a full URL for an image hosted on the backend.
 * @param {string} path - The relative path of the image (e.g., 'uploads/heroes/image.png').
 * @returns {string} The full URL or empty string if path is invalid.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already absolute

  // Ensure path doesn't start with slash to avoid double slashes with base which might not end with one
  // But our API_BASE_URL is http://localhost:5000 (no slash at end)
  // And path likely starts without slash or with slash.
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Helper specifically for hero images if needed, or just use getImageUrl.
 */
export const getHeroImageUrl = (hero) => {
  return getImageUrl(hero?.hero_image_path);
};

export const getRoleIconUrl = (hero) => {
  return getImageUrl(hero?.role_icon_path);
};
