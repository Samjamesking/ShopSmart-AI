const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('shopsmart_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updatePreferences(preferences) {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    return res.json();
  },

  // Products
  async listProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category) query.append('category', params.category);
    if (params.brand) query.append('brand', params.brand);
    if (params.min_price != null) query.append('min_price', params.min_price);
    if (params.max_price != null) query.append('max_price', params.max_price);
    if (params.min_rating != null) query.append('min_rating', params.min_rating);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getProductFilters() {
    const res = await fetch(`${API_BASE}/products/filters`);
    return res.json();
  },

  async getRecommended(limit = 8) {
    const res = await fetch(`${API_BASE}/products/recommended?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getTrending(limit = 6) {
    const res = await fetch(`${API_BASE}/products/trending?limit=${limit}`);
    return res.json();
  },

  async getProductDetail(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  // Chat & AI Assistant
  async sendChatMessage(message, category = null) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        preferred_category: category,
      }),
    });
    return res.json();
  },

  async getRecentSearches() {
    const res = await fetch(`${API_BASE}/chat/recent-searches`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Comparison
  async compareProducts(productIds) {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_ids: productIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Comparison failed');
    }
    return res.json();
  },

  // Reviews
  async getProductReviews(productId) {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
    return res.json();
  },

  async submitReview(productId, rating, reviewText) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        rating,
        review_text: reviewText,
      }),
    });
    return res.json();
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async addToWishlist(productId, targetPrice = null) {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        target_price: targetPrice,
      }),
    });
    return res.json();
  },

  async removeFromWishlist(productId) {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateWishlistItem(productId, targetPrice, alertEnabled) {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        target_price: targetPrice,
        alert_enabled: alertEnabled,
      }),
    });
    return res.json();
  },

  // Price Tracker
  async getPriceTracker(productId) {
    const res = await fetch(`${API_BASE}/price-tracker/${productId}`);
    return res.json();
  },

  async getPriceDropAlerts() {
    const res = await fetch(`${API_BASE}/price-tracker/alerts/active`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Vision / Image Search
  async searchByImage(formData) {
    const token = localStorage.getItem('shopsmart_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/vision/search`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // Admin
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAILogs(limit = 15) {
    const res = await fetch(`${API_BASE}/admin/ai-logs?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteProduct(productId) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
