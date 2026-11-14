import apiClient from './apiClient';

export const adminApi = {
  // Authentication
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data?.data || res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
    }
  },

  // Enquiries
  getEnquiries: async (params = {}) => {
    const res = await apiClient.get('/admin/enquiries', { params });
    return res.data;
  },

  getEnquiryById: async (id) => {
    const res = await apiClient.get(`/admin/enquiries/${id}`);
    return res.data?.data || res.data;
  },

  updateEnquiry: async (id, data) => {
    const res = await apiClient.patch(`/admin/enquiries/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteEnquiry: async (id) => {
    const res = await apiClient.delete(`/admin/enquiries/${id}`);
    return res.data;
  },

  // Resource CRUD factory helper
  resource: (resourcePath) => ({
    list: async (params = {}) => {
      const res = await apiClient.get(`/admin/${resourcePath}`, { params });
      return res.data?.data || res.data;
    },
    get: async (id) => {
      const res = await apiClient.get(`/admin/${resourcePath}/${id}`);
      return res.data?.data || res.data;
    },
    create: async (data) => {
      const res = await apiClient.post(`/admin/${resourcePath}`, data);
      const result = res.data?.data || res.data;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: resourcePath, action: 'create' } }));
      }
      return result;
    },
    update: async (id, data) => {
      const res = await apiClient.put(`/admin/${resourcePath}/${id}`, data);
      const result = res.data?.data || res.data;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: resourcePath, action: 'update' } }));
      }
      return result;
    },
    delete: async (id) => {
      const res = await apiClient.delete(`/admin/${resourcePath}/${id}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: resourcePath, action: 'delete' } }));
      }
      return res.data;
    },
  }),

  // Upload
  uploadImage: async (formData) => {
    const res = await apiClient.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  deleteImage: async (publicId) => {
    const res = await apiClient.delete(`/admin/upload/${encodeURIComponent(publicId)}`);
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data?.data || res.data;
  },

  updateSettings: async (data) => {
    const res = await apiClient.put('/admin/settings', data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: 'settings' } }));
    }
    return res.data?.data || res.data;
  },
};

export default adminApi;
