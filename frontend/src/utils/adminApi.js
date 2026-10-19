// Admin API helpers. These call the admin-only backend endpoints using the
// Bearer token from localStorage. Each returns { ok, data } so callers can
// handle success/failure uniformly.

const BASE = "http://localhost:3000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const request = async (path, options = {}) => {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    // Some endpoints (rare) could return empty bodies; guard JSON parse.
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error(`admin request failed (${path}):`, error);
    return { ok: false, status: 0, data: { error: "Network error" } };
  }
};

/* ---------------- Products ---------------- */

export const createProduct = (categoryId, product) =>
  request(`/protected/categories/${categoryId}/products`, {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (productId, product) =>
  request(`/protected/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

export const deleteProduct = (productId) =>
  request(`/protected/products/${productId}`, { method: "DELETE" });

/* ---------------- Categories ---------------- */

export const createCategory = (title) =>
  request(`/protected/categories`, {
    method: "POST",
    body: JSON.stringify({ Title: title }),
  });

export const updateCategory = (categoryId, title) =>
  request(`/protected/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify({ Title: title }),
  });

export const deleteCategory = (categoryId) =>
  request(`/protected/categories/${categoryId}`, { method: "DELETE" });

/* ---------------- Orders ---------------- */

export const listAllOrders = () =>
  request(`/protected/admin/orders`, { method: "GET" });

export const updateOrderStatus = (orderId, status) =>
  request(`/protected/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
