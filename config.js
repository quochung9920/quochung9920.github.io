// API Configuration
const API_CONFIG = {
  // Thay đổi URL này thành địa chỉ server của bạn
  BASE_URL: 'https://your-server.com/api', // VD: 'https://yourserver.com/api' hoặc 'http://localhost:3000/api'
  
  ENDPOINTS: {
    VISITORS: '/visitors',
    VISITOR_DETAIL: '/visitors/{id}',
    VISITOR_STATS: '/visitors/stats'
  },
  
  // Headers mặc định
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Thêm API key nếu server yêu cầu authentication
    // 'Authorization': 'Bearer YOUR_API_KEY'
  },
  
  // Timeout cho requests (milliseconds)
  TIMEOUT: 10000,
  
  // Có sử dụng fallback localStorage khi server không khả dụng
  USE_FALLBACK: true
};

// Utility functions cho API calls
class APIClient {
  constructor(config) {
    this.config = config;
  }

  async request(endpoint, options = {}) {
    const url = `${this.config.BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: this.config.HEADERS,
      timeout: this.config.TIMEOUT
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.TIMEOUT);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Initialize API client
const apiClient = new APIClient(API_CONFIG);