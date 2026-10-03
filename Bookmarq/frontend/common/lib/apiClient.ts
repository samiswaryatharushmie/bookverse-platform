import axios from 'axios';

/**
 * Axios API client instance.
 *
 * All API requests go through this instance, which:
 * - Points to the backend base URL (proxied by Vite in dev)
 * - Attaches the access token from memory (not localStorage — XSS safe)
 * - Handles 401 responses by attempting a token refresh
 * - Does NOT redirect on 403 (user is authenticated but lacks permission)
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send HttpOnly refresh token cookie
});

// ── Token management (in-memory only — never localStorage) ──────────

let accessToken: string | null = null;

// Promise to deduplicate concurrent refresh calls
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── Proactive token restore (called once on app boot) ────────────────
// Returns the new access token, or null if refresh token is missing/expired
export async function tryRestoreSession(): Promise<string | null> {
  try {
    const { data } = await axios.post('/api/auth/refresh', null, {
      withCredentials: true,
    });
    const token = data.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

// ── Request interceptor: attach bearer token ────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 ONLY for token refresh ─────────
// 403 = authenticated but not authorized → do NOT logout, just reject
// 401 = token expired or missing → attempt refresh

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 (not 403) and only once per request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Never retry the refresh or login endpoints themselves
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = axios
            .post('/api/auth/refresh', null, { withCredentials: true })
            .then((res) => res.data.data.accessToken)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — session truly expired, redirect to login
        setAccessToken(null);
        if (
          !originalRequest.skipAuthRedirect &&
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
