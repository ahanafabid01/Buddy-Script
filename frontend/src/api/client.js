export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || "appifylab_csrf";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;

  const encodedName = encodeURIComponent(name);
  const cookieParts = document.cookie ? document.cookie.split(";") : [];

  for (const part of cookieParts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey !== encodedName) continue;
    const value = rest.join("=");
    return value ? decodeURIComponent(value) : "";
  }

  return null;
}

export function resolveApiUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (/^(data|blob):/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  const normalizedMethod = String(method).toUpperCase();
  const requestOptions = {
    method: normalizedMethod,
    credentials: "include",
    headers: { ...headers },
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(normalizedMethod)) {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (csrfToken) {
      requestOptions.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
      requestOptions.headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      (Array.isArray(data?.details) ? data.details[0]?.message : null) ||
      "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.details || [];
    throw error;
  }

  return data;
}

