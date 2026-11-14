import apiClient from './apiClient';

export const publicApi = {
  // Aggregate initial hydration endpoint
  getSiteContent: async () => {
    const res = await apiClient.get('/site-content');
    return res.data?.data || res.data;
  },

  // Resource endpoints
  getTours: async (params = {}) => {
    const res = await apiClient.get('/tours', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getTourBySlugOrId: async (identifier) => {
    const res = await apiClient.get(`/tours/${identifier}`);
    return res.data?.data || res.data;
  },

  getActivities: async (params = {}) => {
    const res = await apiClient.get('/activities', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getActivityById: async (id) => {
    const res = await apiClient.get(`/activities/${id}`);
    return res.data?.data || res.data;
  },

  getPackages: async (params = {}) => {
    const res = await apiClient.get('/travel-deals', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getPackageBySlugOrId: async (identifier) => {
    const res = await apiClient.get(`/travel-deals/${identifier}`);
    return res.data?.data || res.data;
  },

  getVisas: async (params = {}) => {
    const res = await apiClient.get('/visas', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getTransfers: async (params = {}) => {
    const res = await apiClient.get('/transfers', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getGallery: async (params = {}) => {
    const res = await apiClient.get('/gallery', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getTestimonials: async (params = {}) => {
    const res = await apiClient.get('/testimonials', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getHeroSlides: async (params = {}) => {
    const res = await apiClient.get('/hero-slides', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getWallpapers: async (params = {}) => {
    const res = await apiClient.get('/wallpapers', { params: { ...params, isPublic: true } });
    return res.data?.data || res.data;
  },

  getActivePopup: async () => {
    const res = await apiClient.get('/popups/active');
    return res.data?.data || res.data;
  },

  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data?.data || res.data;
  },

  // Enquiry & Quote submissions
  submitEnquiry: async (payload) => {
    const res = await apiClient.post('/enquiries', payload);
    return res.data;
  },
};

export default publicApi;
