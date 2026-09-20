const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  let cleanEndpoint = endpoint;
  if (!cleanEndpoint.startsWith("http") && !cleanEndpoint.startsWith("/api") && !cleanEndpoint.startsWith("/price")) {
    cleanEndpoint = cleanEndpoint.startsWith("/") ? `/api${cleanEndpoint}` : `/api/${cleanEndpoint}`;
  }
  const url = cleanEndpoint.startsWith("http") ? cleanEndpoint : `${BASE_URL}${cleanEndpoint}`;

  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if expired/invalid
      if (!endpoint.includes("/api/auth/login") && !endpoint.includes("/api/auth/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    const message = (data && data.message) || (typeof data === "string" ? data : "Request failed");
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
  BASE_URL,
};

export default api;
