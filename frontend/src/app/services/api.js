/**
 * Módulo centralizado de chamadas à API backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function getAuthEmail() {
  try {
    const user = JSON.parse(localStorage.getItem("compia_user") || "null");
    return user?.email || "";
  } catch {
    return "";
  }
}

function authHeaders() {
  const email = getAuthEmail();
  return email ? { "X-User-Email": email } : {};
}

async function request(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error?.detail || "Erro na requisição.";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Auth ──────────────────────────────────────────────

export async function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiGetMe() {
  return request("/auth/me");
}

// ── Products ──────────────────────────────────────────

export async function fetchProducts() {
  return request("/products");
}

export async function fetchProduct(id) {
  return request(`/products/${id}`);
}

export async function apiCreateProduct(data) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProduct(id, data) {
  return request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

// ── Orders ────────────────────────────────────────────

export async function fetchOrders() {
  return request("/orders");
}

export async function apiCreateOrder(data) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function apiCancelOrder(orderId) {
  return request(`/orders/${orderId}/cancel`, { method: "PATCH" });
}

// ── Notifications ─────────────────────────────────────

export async function fetchNotifications() {
  return request("/notifications");
}

export async function apiMarkNotificationsRead() {
  return request("/notifications/read", { method: "PATCH" });
}

// ── Contact ───────────────────────────────────────────

export async function apiSubmitContact(data) {
  return request("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
