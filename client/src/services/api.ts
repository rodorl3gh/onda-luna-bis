const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.reload();
    throw new Error("No autorizado");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || `Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
