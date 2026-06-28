// Central config for the backend API base URL.
// In development: falls back to http://localhost:5000
// In production: set VITE_API_BASE_URL to your Render backend URL (e.g. https://your-app.onrender.com)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
