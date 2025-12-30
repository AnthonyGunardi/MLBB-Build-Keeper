/* c8 ignore start -- env fallbacks run at module load before tests execute */
const env = import.meta.env || {};
export const API_BASE_URL = env.VITE_API_URL || 'http://localhost:5000';

if (!env.VITE_API_URL) {
  console.warn('VITE_API_URL not found in environment. Falling back to http://localhost:5000');
}
/* c8 ignore stop */

export const API_URL = `${API_BASE_URL}/api`;
