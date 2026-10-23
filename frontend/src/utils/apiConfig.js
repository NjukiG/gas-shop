// Central API base URL. Reads VITE_API_URL at build time (set in CI / .env),
// falling back to the local dev server. All API calls should use API_URL so
// the backend endpoint is configurable per environment (local vs cloud).
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
